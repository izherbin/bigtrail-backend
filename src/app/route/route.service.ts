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
import { ClientException } from '../client.exception'
import { GetProfileResponse } from '../user/dto/get-profile.response'
import { ConfigService } from '@nestjs/config'
import { FavoritesService } from '../favorites/favorites.service'

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
      createRoute.timestamp = Date.now()

      const route = await createRoute.save()
      // route.id = route._id.toString()

      const profile = await this.updateUserStatistics(userId)
      this.pubSub.publish('profileChanged', { watchProfile: profile })

      const emit: SubscriptionRouteResponse = {
        function: 'ADD',
        id: route._id,
        data: route as Route,
        userId: route.userId
      }
      this.pubSub.publish('routeChanged', { watchUserRoutes: emit })
    })

    return uploads
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
        throw new ClientException(40402)
      })
    )
    if (!route) {
      throw new ClientException(40402)
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

  watchUserRoutes() {
    const res = this.pubSub.asyncIterator('routeChanged')
    return res
  }

  findOne(id: number) {
    return `This action returns a #${id} route`
  }

  async edit(
    userId: MongooSchema.Types.ObjectId,
    editRouteInput: EditRouteInput
  ) {
    const { id } = editRouteInput
    const route = await this.routeModel.findById(id)
    if (!route) {
      throw new ClientException(40402)
    }
    if (route.userId.toString() !== userId.toString()) {
      throw new ClientException(40310)
    }

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
      const route = await this.routeModel.findByIdAndUpdate(
        id,
        editRouteInput,
        { new: true }
      )

      const profile = await this.updateUserStatistics(userId)
      this.pubSub.publish('profileChanged', { watchProfile: profile })

      const emit: SubscriptionRouteResponse = {
        function: 'UPDATE',
        id: route._id,
        data: route as Route,
        userId: route.userId
      }
      this.pubSub.publish('routeChanged', { watchUserRoutes: emit })
    })

    return uploads
  }

  async remove(
    userId: MongooSchema.Types.ObjectId,
    deleteTrackInput: DeleteRouteInput
  ) {
    const { id } = deleteTrackInput
    const route = await this.routeModel.findById(id)
    if (!route) {
      throw new ClientException(40403)
    }

    if (route.userId.toString() !== userId.toString()) {
      throw new ClientException(40301)
    }

    await this.routeModel.findByIdAndDelete(id)

    const profile = await this.updateUserStatistics(userId)
    this.pubSub.publish('profileChanged', { watchProfile: profile })

    const emit: SubscriptionRouteResponse = {
      function: 'DELETE',
      id: route._id,
      userId: route.userId
    }
    this.pubSub.publish('routeChanged', { watchUserRoutes: emit })

    return `Успешно удален мвршрут ${id} `
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
        points: 0
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

  async filterRoutes(routes: Route[], filter: RouteFilterInput) {
    function isFilterFails(filter: string[] | null, value: string) {
      const isFilterEmpty =
        !filter || (Array.isArray(filter) && filter.length == 0)
      return (
        !isFilterEmpty && !(Array.isArray(filter) && filter.includes(value))
      )
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

    function routesSimplify(routes: Route[], tolerance: number) {
      for (const route of routes) {
        route.points = simplifyPoints(route.points, tolerance, false)
      }
      return routes
    }

    const {
      id,
      userId,
      search,
      transit,
      difficulty,
      category,
      similar,
      simplify,
      max
    } = filter || {}

    if (id) {
      //? const place = await this.getRoute({ id })
      const routesFiltered = routes.filter((r) => r._id.toString() === id)
      const routesSimplified = simplify
        ? routesSimplify(routesFiltered, simplify)
        : routesFiltered
      return routesSimplified
    }

    let routesSimilar: Route[]
    if (similar) {
      const reference = await this.routeModel.findById(similar)
      routesSimilar = routes
        .sort((a: Route, b: Route) => {
          return (
            this.calcDistanceL2(reference, a) -
            this.calcDistanceL2(reference, b)
          )
        })
        .filter((route: Route) => {
          return route._id.toString() !== similar.toString()
        })
    } else {
      routesSimilar = routes
    }

    const routesFiltered = routesSimilar.filter((route) => {
      if (isUserIdFails(userId, route.userId)) return false
      else if (
        isSearchFails(search, route.name) &&
        isSearchFails(search, route.description) &&
        isSearchFails(search, route.address)
      )
        return false
      else if (isFilterFails(transit, route.transit)) return false
      else if (isFilterFails(difficulty, route.difficulty)) return false
      else if (isFilterFails(category, route.category)) return false
      else return true
    })

    const routesSimplified = simplify
      ? routesSimplify(routesFiltered, simplify)
      : routesFiltered
    return routesSimplified.slice(
      0,
      max && max < routesFiltered.length ? max : routesFiltered.length
    )
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
      throw new ClientException(40402)
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

    return Promise.allSettled(renews).then(() => {
      if (shouldSave) {
        route.markModified('photos')
        route.markModified('notes')
        return route.save()
      } else {
        return route
      }
    })
  }
}
