import { Inject, Injectable } from '@nestjs/common'
import { CreateRouteInput } from './dto/create-route.input'
import { EditRouteInput } from './dto/edit-route.input'
import { InjectModel } from '@nestjs/mongoose'
import { Route, RouteDocument } from './entities/route.entity'
import { MinioClientService } from '../minio-client/minio-client.service'
import { Document, Model, Schema as MongooSchema, Types } from 'mongoose'
import { TrackService } from '../track/track.service'
import { PubSubEngine } from 'graphql-subscriptions'
import { SubscriptionRouteResponse } from './dto/subscription-route.response'
import { RouteFilterInput } from './dto/route-filter.input'
import { UserService } from '../user/user.service'
import { DeleteRouteInput } from './dto/delete-route.input'
import { GetRouteInput } from './dto/get-route.input'
import { stringSimilarity } from './string-similarity'
import { simplifyPoints } from '../track/simplify'
import { ClientErrors, ClientException } from '../client.exception'
import { GetProfileResponse } from '../user/dto/get-profile.response'
import { ConfigService } from '@nestjs/config'
import { FavoritesService } from '../favorites/favorites.service'
import { SetModeratedRouteInput } from './dto/set-moderated-route.input'
import { SetVerifiedRouteInput } from './dto/set-verified-route.input'
import { DeleteContentInput } from '../admin/dto/delete-content.input'
import { CreateReviewInput } from '../review/dto/create-review.input'
import { Review } from '../review/entities/review.entity'
import { UploadPhoto } from '../track/dto/upload-photo.response'
import { DeleteReviewInput } from '../review/dto/delete-review.input'
import { GetReviewsInput } from '../review/dto/get-reviews.input'
import { NotificationService } from '../notification/notification.service'
import { SubscriptionReviewResponse } from '../review/dto/subscription-review.response'
import {
  distance2AltitudeGraph,
  time2DistanceGraph,
  time2SpeedGraph,
  trackStatistics
} from '../track/track-statistics'
import { GetRouteGraphInput } from './dto/get-route-graph.input'

const STRING_SIMULARITY_THRESHOLD = 0.65

@Injectable()
export class RouteService {
  constructor(
    @InjectModel(Route.name)
    private routeModel: Model<RouteDocument>,
    private readonly configService: ConfigService,
    private readonly minioClientService: MinioClientService,
    private readonly trackService: TrackService,
    private readonly favoritesService: FavoritesService,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
    @Inject('PUB_SUB') private pubSub: PubSubEngine
  ) {}

  async create(
    userId: MongooSchema.Types.ObjectId,
    createRouteInput: CreateRouteInput
  ) {
    const elevations = []
    for (const p in createRouteInput.points) {
      if (!createRouteInput.points[p].alt) {
        elevations.push(
          this.trackService
            .getElevation(
              createRouteInput.points[p].lat,
              createRouteInput.points[p].lon
            )
            .then((elev) => {
              createRouteInput.points[p].alt = elev
            })
        )
      }
    }

    const uploads = []
    const downloads = []

    for (const sp in createRouteInput.photos) {
      const photo = await this.trackService.uploadPhoto(
        createRouteInput.photos[sp]
      )
      if (photo) {
        uploads.push(photo.upload)
        downloads.push(photo.download)
      }
    }

    for (const n in createRouteInput.notes) {
      if (createRouteInput.notes[n].point) {
        if (!createRouteInput.notes[n].point.alt) {
          elevations.push(
            this.trackService
              .getElevation(
                createRouteInput.notes[n].point.lat,
                createRouteInput.notes[n].point.lon
              )
              .then((elev) => {
                createRouteInput.notes[n].point.alt = elev
              })
          )
        }
      }

      for (const p in createRouteInput.notes[n].photos) {
        const photo = await this.trackService.uploadPhoto(
          createRouteInput.notes[n].photos[p]
        )
        if (photo) {
          uploads.push(photo.upload)
          downloads.push(photo.download)
        }
      }
    }

    Promise.allSettled(downloads.concat(elevations)).then(async () => {
      const createRoute = new this.routeModel(createRouteInput)
      createRoute.userId = userId
      createRoute.timestamp = Date.now() //TODO Delete this if timestamp is not needed
      createRoute.tsCreated = new Date().getTime()
      const route = await this.updateRouteStatistics(createRoute)
      route.markModified('statistics')
      route.distance = route.statistics.distance || 0
      await route.save()
      // route.id = route._id.toString()

      await this.notificationService.create({
        userId: userId,
        type: 'route',
        contentId: route._id,
        event: 'ADD',
        title: null,
        text: null
      })

      const profile = await this.updateUserStatistics(userId)
      this.pubSub.publish('profileChanged', { watchProfile: profile })

      const emit: SubscriptionRouteResponse = {
        function: 'ADD',
        id: route._id,
        data: route as Route,
        userId: route.userId
      }
      this.pubSub.publish('routeChanged', { watchRoutes: emit })
    })

    return uploads
  }

  async addReview(
    pubSubReview: PubSubEngine,
    userId: Types.ObjectId,
    createReviewInput: CreateReviewInput
  ): Promise<UploadPhoto[]> {
    const { contentId: routeId, ...payload } = createReviewInput
    const review = payload as Review
    review.userId = userId
    review.tsCreated = Date.now()

    const route = await this.renewOneRoutePhotos(
      await this.routeModel.findById(routeId)
    )
    if (!route) {
      throw new ClientException(ClientErrors['No such route'])
    }

    if (userId.toString() === route.userId.toString()) {
      throw new ClientException(
        ClientErrors['Impossible to review user`s own route']
      )
    }

    const reviewIdx = route.reviews.findIndex(
      (r) => r.userId.toString() === userId.toString()
    )

    const uploads: UploadPhoto[] = []
    const downloads = [] as Promise<any>[]

    for (const p in review.photos) {
      const photo = await this.trackService.uploadPhoto(review.photos[p])
      if (photo) {
        uploads.push(photo.upload)
        downloads.push(photo.download)
      }
    }

    let isNewReview: boolean
    Promise.allSettled(downloads).then(async () => {
      if (reviewIdx >= 0) {
        route.reviews[reviewIdx] = review
        isNewReview = false
      } else {
        route.reviews.push(review)
        isNewReview = true
      }

      route.reviewsCount = route.reviews.length
      route.markModified('reviewsCount')
      const ratingTotal = route.reviews.reduce(
        (total, review) => total + review.rating,
        0
      )
      route.rating =
        Math.round(
          (route.reviews.length ? ratingTotal / route.reviews.length : 0) * 10
        ) / 10

      route.markModified('rating')
      route.markModified('reviews')
      await route.save()

      const emit: SubscriptionRouteResponse = {
        function: 'UPDATE',
        id: route._id,
        data: route as Route,
        userId: route.userId
      }
      this.pubSub.publish('routeChanged', { watchRoutes: emit })

      const emitReview: SubscriptionReviewResponse = {
        function: isNewReview ? 'ADD' : 'UPDATE',
        type: 'route',
        contentId: route._id,
        userId: userId as unknown as MongooSchema.Types.ObjectId,
        data: review
      }
      pubSubReview.publish('reviewChanged', { watchReviews: emitReview })
    })

    return uploads
  }

  async deleteReview(
    pubSubReview: PubSubEngine,
    userId: MongooSchema.Types.ObjectId,
    deleteReviewInput: DeleteReviewInput
  ) {
    const { contentId: id } = deleteReviewInput
    const route = await this.routeModel.findById(id)

    if (!route) {
      throw new ClientException(ClientErrors['No such route'])
    }

    if (userId.toString() === route.userId.toString()) {
      return 'Отсутствует ревью для удаления'
    }

    const reviewIdx = route.reviews.findIndex(
      (r) => r.userId.toString() === userId.toString()
    )

    if (reviewIdx >= 0) {
      route.reviews.splice(reviewIdx, 1)
      route.reviewsCount = route.reviews.length
      route.markModified('reviewsCount')
      const ratingTotal = route.reviews.reduce(
        (total, review) => total + review.rating,
        0
      )
      route.rating =
        Math.round(
          (route.reviews.length ? ratingTotal / route.reviews.length : 0) * 10
        ) / 10
      route.markModified('rating')
      route.markModified('reviews')
      await route.save()

      const emit: SubscriptionRouteResponse = {
        function: 'UPDATE',
        id: route._id,
        data: route as Route,
        userId: route.userId
      }
      this.pubSub.publish('routeChanged', { watchRoutes: emit })

      const emitReview: SubscriptionReviewResponse = {
        function: 'DELETE',
        type: 'route',
        contentId: route._id,
        userId: userId as unknown as MongooSchema.Types.ObjectId
      }
      pubSubReview.publish('reviewChanged', { watchReviews: emitReview })

      return 'Ревью успешно удалено'
    } else {
      return 'Отсутствует ревью для удаления'
    }
  }

  findAll() {
    return `This action returns all route`
  }

  async getUserRoutes(userId: MongooSchema.Types.ObjectId) {
    const routes: Route[] = await this.renewManyRoutesPhotos(
      await this.routeModel.find({ userId })
    )

    const favorites = await this.favoritesService.findAll(userId)
    routes.forEach((route) => {
      const isFavorite = !!favorites.find(
        (f) => f.id.toString() === route.id.toString()
      )
      route.favorite = isFavorite
    })

    return routes
  }

  async getRoutes(
    userId: MongooSchema.Types.ObjectId,
    filter: RouteFilterInput
  ) {
    const routes = await this.renewManyRoutesPhotos(
      await this.routeModel.find({})
    )
    const routesFiltered = await this.filterRoutes(routes, filter)

    const favorites = userId ? await this.favoritesService.findAll(userId) : []
    routesFiltered.forEach((route) => {
      const isFavorite = !!favorites.find(
        (f) => f.id.toString() === route.id.toString()
      )
      route.favorite = isFavorite
    })

    return routesFiltered
  }

  async getRoute(getRouteInput: GetRouteInput) {
    const { id } = getRouteInput
    const route = await this.renewOneRoutePhotos(
      await this.routeModel.findById(id).catch((error) => {
        console.error(
          '\x1b[31m[Nest] - \x1b[37m',
          new Date().toLocaleString('en-EN'),
          '\x1b[31mERROR',
          '\x1b[33m[Exception Handler]\x1b[31m',
          error.message,
          '\x1b[37m'
        )
        throw new ClientException(ClientErrors['No such route'])
      })
    )
    if (!route) {
      throw new ClientException(ClientErrors['No such route'])
    }

    route.id = route._id
    route.favorite = await this.favoritesService.isFavorite(
      route.userId,
      route._id
    )
    return route as Route
  }

  async getRoutesCount(filter: RouteFilterInput) {
    const routes = await this.routeModel.find({})
    const routesFiltered = await this.filterRoutes(routes, filter)
    return routesFiltered.length
  }

  watchRoutes() {
    const res = this.pubSub.asyncIterator('routeChanged')
    return res
  }

  findOne(id: number) {
    return `This action returns a #${id} route`
  }

  async getReviews(getReviewsInput: GetReviewsInput) {
    const { contentId: id } = getReviewsInput

    const route = await this.renewOneRoutePhotos(
      await this.routeModel.findById(id)
    )
    if (!route) {
      throw new ClientException(ClientErrors['No such route'])
    }

    return route.reviews || []
  }

  async updateUserRoute(
    userId: MongooSchema.Types.ObjectId,
    editRouteInput: EditRouteInput
  ) {
    const { id } = editRouteInput
    const route = await this.routeModel.findById(id)
    if (!route) {
      throw new ClientException(ClientErrors['No such route'])
    }
    if (route.userId.toString() !== userId.toString()) {
      throw new ClientException(
        ClientErrors['Impossible to edit someone else`s route']
      )
    }

    const uploads = await this.edit(route, editRouteInput)

    await this.notificationService.create({
      userId: route.userId,
      type: 'route',
      contentId: route._id,
      event: 'UPDATE',
      title: null,
      text: null
    })

    return uploads
  }

  async updateRoute(editRouteInput: EditRouteInput) {
    const { id } = editRouteInput
    const route = await this.routeModel.findById(id)
    if (!route) {
      throw new ClientException(ClientErrors['No such route'])
    }

    const uploads = await this.edit(route, editRouteInput)

    await this.notificationService.create({
      userId: route.userId,
      type: 'route',
      contentId: route._id,
      event: 'UPDATE',
      title: null,
      text: null
    })

    return uploads
  }

  async edit(
    route: Document<unknown, object, RouteDocument> &
      Route &
      Document<any, any, any> & {
        _id: Types.ObjectId
      },
    editRouteInput: EditRouteInput
  ) {
    const elevations = []
    for (const p in editRouteInput.points) {
      if (!editRouteInput.points[p].alt) {
        elevations.push(
          this.trackService
            .getElevation(
              editRouteInput.points[p].lat,
              editRouteInput.points[p].lon
            )
            .then((elev) => {
              editRouteInput.points[p].alt = elev
            })
        )
      }
    }

    const uploads = []
    const downloads = []

    for (const sp in editRouteInput.photos) {
      const photo = await this.trackService.uploadPhoto(
        editRouteInput.photos[sp]
      )
      if (photo) {
        uploads.push(photo.upload)
        downloads.push(photo.download)
      }
    }

    for (const n in editRouteInput.notes) {
      if (editRouteInput.notes[n].point) {
        if (!editRouteInput.notes[n].point.alt) {
          elevations.push(
            this.trackService
              .getElevation(
                editRouteInput.notes[n].point.lat,
                editRouteInput.notes[n].point.lon
              )
              .then((elev) => {
                editRouteInput.notes[n].point.alt = elev
              })
          )
        }
      }

      for (const p in editRouteInput.notes[n].photos) {
        const photo = await this.trackService.uploadPhoto(
          editRouteInput.notes[n].photos[p]
        )
        if (photo) {
          uploads.push(photo.upload)
          downloads.push(photo.download)
        }
      }
    }

    Promise.allSettled(downloads.concat(elevations)).then(async () => {
      route.set(editRouteInput)
      const routeSave = await this.updateRouteStatistics(route)
      routeSave.markModified('statistics')
      routeSave.distance = routeSave.statistics.distance || 0
      await routeSave.save()

      const profile = await this.updateUserStatistics(route.userId)
      this.pubSub.publish('profileChanged', { watchProfile: profile })

      const emit: SubscriptionRouteResponse = {
        function: 'UPDATE',
        id: route._id,
        data: route as Route,
        userId: route.userId
      }
      this.pubSub.publish('routeChanged', { watchRoutes: emit })
    })

    return uploads
  }

  async setModerated(setModeratedRouteInput: SetModeratedRouteInput) {
    const { id } = setModeratedRouteInput
    const route = await this.routeModel.findById(id)
    if (!route) {
      throw new ClientException(ClientErrors['No such route'])
    }

    if (route.moderated) {
      throw new ClientException(ClientErrors['This route is already moderated'])
    }

    route.moderated = true
    const uploads = await this.edit(route, setModeratedRouteInput)

    await this.notificationService.create({
      userId: route.userId,
      type: 'route',
      contentId: route._id,
      event: 'MODERATE',
      title: null,
      text: null
    })

    const emit: SubscriptionRouteResponse = {
      function: 'UPDATE',
      id: route._id,
      data: route as Route,
      userId: route.userId
    }
    this.pubSub.publish('routeChanged', { watchRoutes: emit })

    return uploads
  }

  async setVerified(setVerifiedRouteInput: SetVerifiedRouteInput) {
    const { id } = setVerifiedRouteInput
    const route = await this.routeModel.findById(id)
    if (!route) {
      throw new ClientException(ClientErrors['No such route'])
    }

    if (route.verified) {
      throw new ClientException(ClientErrors['This route is already verified'])
    }

    route.verified = true
    const uploads = await this.edit(route, setVerifiedRouteInput)

    await this.notificationService.create({
      userId: route.userId,
      type: 'route',
      contentId: route._id,
      event: 'VERIFY',
      title: null,
      text: null
    })

    const emit: SubscriptionRouteResponse = {
      function: 'UPDATE',
      id: route._id,
      data: route as Route,
      userId: route.userId
    }
    this.pubSub.publish('routeChanged', { watchRoutes: emit })

    return uploads
  }

  async remove(
    userId: MongooSchema.Types.ObjectId,
    deleteRouteInput: DeleteRouteInput
  ) {
    const { id } = deleteRouteInput
    const route = await this.routeModel.findById(id)
    if (!route) {
      throw new ClientException(ClientErrors['No such route'])
    }

    if (route.userId.toString() !== userId.toString()) {
      throw new ClientException(
        ClientErrors['Impossible to delete someone else`s route']
      )
    }

    route.moderated = false
    route.verified = false
    route.userId = await this.userService.getContentOwnerId()
    route.deleted = true
    await route.save()

    await this.notificationService.create({
      userId: userId,
      type: 'route',
      contentId: route._id,
      event: 'DELETE',
      title: null,
      text: null
    })

    const profile = await this.updateUserStatistics(userId)
    this.pubSub.publish('profileChanged', { watchProfile: profile })

    const emit: SubscriptionRouteResponse = {
      function: 'DELETE',
      id: route._id,
      userId
    }
    this.pubSub.publish('routeChanged', { watchRoutes: emit })

    return `Успешно удален маршрут ${id} `
  }

  async wipeout(deleteRouteInput: DeleteContentInput) {
    const { id } = deleteRouteInput
    const route = await this.routeModel.findById(id)
    if (!route) {
      throw new ClientException(ClientErrors['No such route'])
    }

    if (route.moderated || route.verified) {
      throw new ClientException(
        ClientErrors['Impossible to wipe out moderated or verified route']
      )
    }

    const userId = route.userId
    await this.routeModel.findByIdAndDelete(id)

    const profile = await this.updateUserStatistics(userId)
    this.pubSub.publish('profileChanged', { watchProfile: profile })

    const emit: SubscriptionRouteResponse = {
      function: 'DELETE',
      id: route._id,
      userId
    }
    this.pubSub.publish('routeChanged', { watchRoutes: emit })

    return `Успешно стерт маршрут ${id} `
  }

  async updateUserStatistics(userId: MongooSchema.Types.ObjectId) {
    const user = await this.userService.getUserById(userId)
    if (!user.statistics) {
      user.statistics = {
        subscribers: 0,
        subscriptions: 0,
        places: 0,
        routes: 0,
        tracks: 0,
        duration: 0,
        distance: 0,
        points: 0,
        notificationsUnread: 0
      }
    }

    const routes = await this.routeModel.find({ userId })

    user.statistics.routes = routes.length
    user.statistics.points =
      user.statistics.routes *
        Number(this.configService.get<string>('POINTS_PER_ROUTE')) +
      user.statistics.tracks *
        Number(this.configService.get<string>('POINTS_PER_TRACK')) +
      user.statistics.places *
        Number(this.configService.get<string>('POINTS_PER_PLACE'))

    user.save()
    return user as GetProfileResponse
  }

  async updateRouteStatistics(
    route: Document<unknown, object, RouteDocument> &
      Route &
      Document<any, any, any> & {
        _id: Types.ObjectId // route.id = route._id.toString()
      }
  ) {
    route.statistics = await trackStatistics(route.points)
    return route
  }

  async getRouteGraph(getRouteGraphInput: GetRouteGraphInput) {
    const { id, type } = getRouteGraphInput
    const route = await this.routeModel.findById(id)
    if (!route) {
      throw new ClientException(ClientErrors['No such route'])
    }

    switch (type) {
      case 'TIME2DISTANCE':
        return time2DistanceGraph(route.points)
      case 'TIME2SPEED':
        return time2SpeedGraph(route.points)
      case 'DISTANCE2ALTITUDE':
        return distance2AltitudeGraph(route.points)
      default:
        throw new ClientException(ClientErrors['No such graph type'])
    }
  }

  async getAdminStatistics() {
    return await this.routeModel.countDocuments()
  }

  async filterRoutes(routes: Route[], filter: RouteFilterInput) {
    function isStringFilterFails(filter: string[] | null, value: string) {
      const isFilterEmpty =
        !filter || (Array.isArray(filter) && filter.length == 0)
      return (
        !isFilterEmpty && !(Array.isArray(filter) && filter.includes(value))
      )
    }

    function isBooleanFilterFails(
      filter: boolean | null | undefined,
      value: boolean
    ) {
      if (filter === true) {
        return !value
      } else if (filter === false) {
        return value
      } else {
        return false
      }
    }

    function isUserIdFails(
      userId: MongooSchema.Types.ObjectId | null,
      value: MongooSchema.Types.ObjectId
    ) {
      const isUserIdEmpty = !userId
      return !isUserIdEmpty && userId?.toString() !== value?.toString()
    }

    function isSearchFails(search: string | null, value: string | null) {
      const isSearchEmpty = !search
      return (
        !isSearchEmpty &&
        stringSimilarity(search, value) < STRING_SIMULARITY_THRESHOLD
      )
    }

    function isArrayStrictFilterFails(
      array: number[] | null,
      value: number[] | null
    ) {
      if (!array || (Array.isArray(array) && array.length == 0)) return false
      else if (!value || (Array.isArray(value) && value.length == 0))
        return true
      else {
        const isFit = array.every((a) => value.includes(a))
        return !isFit
      }
    }

    function isLimitsFilterFails(
      limits: { from?: number; to?: number } | null,
      value: number | null
    ) {
      if (!limits) return false
      else if (!value) return true
      else {
        const { from = 0, to } = limits
        const isFit = value >= from && (to ? value <= to : true)
        return !isFit
      }
    }

    function routesSimplify(routes: Route[], tolerance: number) {
      for (const route of routes) {
        route.points = simplifyPoints(route.points, tolerance, false)
      }
      return routes
    }

    const {
      ids,
      userId,
      search,
      transit,
      difficulty,
      start,
      end,
      category,
      sort,
      order = 'asc',
      similar,
      availability,
      duration,
      simplify,
      moderated,
      verified,
      from,
      to
    } = filter || {}

    const tsCreatedLimits = !start && !end ? null : { from: start, to: end }

    if (ids && Array.isArray(ids) && ids.length > 0) {
      const routesFiltered = routes.filter((route) =>
        ids.includes(route._id.toString())
      )
      const routesSimplified = simplify
        ? routesSimplify(routesFiltered, simplify)
        : routesFiltered
      return routesSimplified
    }

    let routesSorted = routes
    if (sort === 'similarity') {
      if (!similar) {
        throw new ClientException(ClientErrors['Similar id is not specified'])
      }
      routesSorted = await this.sortBySimilarity(routes, similar, order)
    } else if (sort === 'date') {
      routesSorted = await this.sortByDate(routes, order)
    } else if (sort === null || sort === undefined) {
      if (similar) {
        routesSorted = await this.sortBySimilarity(routes, similar, order)
      } else {
        routesSorted = await this.sortByDate(routes, order)
      }
    } else {
      throw new ClientException(ClientErrors['Illegal sorting method'])
    }

    const routesFiltered = routesSorted.filter((route) => {
      if (isUserIdFails(userId, route.userId)) return false
      else if (
        isSearchFails(search, route.name) &&
        isSearchFails(search, route.description) &&
        isSearchFails(search, route.address)
      )
        return false
      else if (isStringFilterFails(transit, route.transit)) return false
      else if (isStringFilterFails(difficulty, route.difficulty)) return false
      else if (isStringFilterFails(category, route.category)) return false
      else if (isBooleanFilterFails(moderated, route.moderated)) return false
      else if (isBooleanFilterFails(verified, route.verified)) return false
      else if (isArrayStrictFilterFails(availability, route.availability))
        return false
      else if (isLimitsFilterFails(duration, route.duration)) return false
      else if (isLimitsFilterFails(tsCreatedLimits, route.tsCreated))
        return false
      else return true
    })

    const routesSimplified = simplify
      ? routesSimplify(routesFiltered, simplify)
      : routesFiltered

    const outputStart = from && from > 0 ? from : 0
    const outputEnd =
      to && to < routesFiltered.length ? to : routesFiltered.length
    return routesSimplified.slice(outputStart, outputEnd)
  }

  async sortBySimilarity(
    routes: Route[],
    similar: MongooSchema.Types.ObjectId,
    order: string
  ) {
    const reference = await this.routeModel.findById(similar)
    routes.sort((a: Route, b: Route) => {
      return (
        this.calcDistanceL2(reference, a) - this.calcDistanceL2(reference, b)
      )
    })

    if (order === 'desc') {
      routes.reverse()
    }

    return routes.filter((r) => r._id.toString() !== similar.toString())
  }

  async sortByDate(routes: Route[], order: string) {
    routes.sort((a: Route, b: Route) => {
      return (a.tsCreated - b.tsCreated) * (order === 'asc' ? 1 : -1)
    })
    return routes
  }
  calcDistanceL2(sourceRoute: Route, targetRoute: Route) {
    if (!sourceRoute.points[0] || !targetRoute.points[0]) return null

    const distance =
      (sourceRoute.points[0].lat - targetRoute.points[0].lat) ** 2 +
      (sourceRoute.points[0].lon - targetRoute.points[0].lon) ** 2

    return distance
  }

  async renewManyRoutesPhotos(
    routes: (Document<unknown, object, RouteDocument> &
      Route &
      Document<any, any, any> & { _id: Types.ObjectId })[]
  ) {
    const renews = []
    const res = []
    for (const route of routes) {
      renews.push(
        this.renewOneRoutePhotos(route).then((route) => {
          res.push(route)
        })
      )
    }

    await Promise.allSettled(renews)
    return res
  }

  async renewOneRoutePhotos(
    route: Document<unknown, object, RouteDocument> &
      Route &
      Document<any, any, any> & { _id: Types.ObjectId }
  ) {
    if (!route) {
      throw new ClientException(ClientErrors['No such route'])
    }

    let shouldSave = false
    const renews = []
    for (const photo of route?.photos) {
      if (photo?.uri) {
        renews.push(
          this.minioClientService.renewLink(photo.uri).then((uri) => {
            if (uri) {
              photo.uri = uri
              shouldSave = true
            }
          })
        )
      }
    }

    for (const note of route?.notes) {
      if (!note.photos) continue

      for (const photo of note?.photos) {
        if (photo?.uri) {
          renews.push(
            this.minioClientService.renewLink(photo.uri).then((uri) => {
              if (uri) {
                photo.uri = uri
                shouldSave = true
              }
            })
          )
        }
      }
    }

    for (const review of route?.reviews) {
      if (!review?.photos) continue

      for (const photo of review?.photos) {
        if (photo?.uri) {
          renews.push(
            this.minioClientService.renewLink(photo.uri).then((uri) => {
              if (uri) {
                photo.uri = uri
                shouldSave = true
              }
            })
          )
        }
      }
    }

    return Promise.allSettled(renews).then(() => {
      if (shouldSave) {
        route.markModified('photos')
        route.markModified('notes')
        route.markModified('reviews')
        return route.save()
      } else {
        return route
      }
    })
  }
}
