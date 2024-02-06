import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef
} from '@nestjs/common'
import { CreateRouteInput } from './dto/create-route.input'
import { UpdateRouteInput } from './dto/update-route.input'
import { InjectModel } from '@nestjs/mongoose'
import { Route, RouteDocument } from './entities/route.entity'
import { MinioClientService } from '../minio-client/minio-client.service'
import { Model, Schema as MongooSchema } from 'mongoose'
import { TrackService } from '../track/track.service'
import { PubSubEngine } from 'graphql-subscriptions'
import { SubscriptionRouteResponse } from './dto/subscription-route.response'
import { RouteFilterInput } from './dto/route-filter.input'
import { UserService } from '../user/user.service'
import { DeleteRouteInput } from './dto/delete-route.input'
import { GetRouteInput } from './dto/get-route.input'

@Injectable()
export class RouteService {
  constructor(
    @InjectModel(Route.name)
    private routeModel: Model<RouteDocument>,
    private readonly minioClientService: MinioClientService,
    private readonly trackService: TrackService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject('PUB_SUB') private pubSub: PubSubEngine
  ) {}

  async create(
    userId: MongooSchema.Types.ObjectId,
    createRouteInput: CreateRouteInput
  ) {
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

    Promise.allSettled(downloads).then(async () => {
      const createRoute = new this.routeModel(createRouteInput)
      createRoute.userId = userId

      const route = await createRoute.save()
      // route.id = route._id.toString()

      const profile = await this.userService.getProfileById(userId)
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
    const routes = await this.routeModel.find({ userId })
    return routes
  }

  async getRoutes(filter: RouteFilterInput) {
    const routes = await this.routeModel.find({})
    const routesFiltered = await this.filterRoutes(routes, filter)
    return routesFiltered
  }

  async getRoute(getRouteInput: GetRouteInput) {
    const { id } = getRouteInput
    const route = await this.routeModel.findById(id)
    if (!route) {
      throw new HttpException('No such route', HttpStatus.NOT_FOUND)
    }

    route.id = route._id
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

  update(id: number, updateRouteInput: UpdateRouteInput) {
    console.log('updateRouteInput:', updateRouteInput)
    return `This action updates a #${id} route`
  }

  async remove(
    userId: MongooSchema.Types.ObjectId,
    deleteTrackInput: DeleteRouteInput
  ) {
    const { id } = deleteTrackInput
    const route = await this.routeModel.findById(id)
    if (!route) {
      throw new HttpException('No such user', HttpStatus.NOT_FOUND)
    }

    if (route.userId.toString() !== userId.toString()) {
      throw new HttpException(
        'Impossible to delete someone else`s track',
        HttpStatus.FORBIDDEN
      )
    }

    await this.routeModel.findByIdAndDelete(id)

    const profile = await this.userService.getProfileById(userId)
    this.pubSub.publish('profileChanged', { watchProfile: profile })

    const emit: SubscriptionRouteResponse = {
      function: 'DELETE',
      id: route._id,
      userId: route.userId
    }
    this.pubSub.publish('routeChanged', { watchUserRoutes: emit })

    return `Успешно удален маршрут № ${id} `
  }

  async calcUserStatistics(userId: MongooSchema.Types.ObjectId) {
    const routes = await this.routeModel.find({ userId })

    const { duration, distance, tracks } =
      await this.trackService.calcUserTrackStatistics(userId)

    const res = {
      subscribers: 0,
      subscriptions: 0,
      routes: routes.length,
      duration,
      distance,
      points: routes.length * 50 + tracks * 10
    }
    return res
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
      const isUserIdEmpty = !filter
      return !isUserIdEmpty && userId.toString() !== value.toString()
    }

    const { userId, transit, difficulty, category, similar, max } = filter || {}

    let routesSimilar: Route[]
    if (similar) {
      const reference = await this.routeModel.findById(similar)
      routesSimilar = routes.sort((a: Route, b: Route) => {
        return (
          this.calcDistanceL2(reference, a) - this.calcDistanceL2(reference, b)
        )
      })
    } else {
      routesSimilar = routes
    }

    const routesFiltered = routesSimilar.filter((route) => {
      if (isUserIdFails(userId, route.userId)) return false
      else if (isFilterFails(transit, route.transit)) return false
      else if (isFilterFails(difficulty, route.difficulty)) return false
      else if (isFilterFails(category, route.category)) return false
      else return true
    })

    return routesFiltered.slice(
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
}
