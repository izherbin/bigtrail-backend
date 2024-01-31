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
import { PubSub, PubSubEngine } from 'graphql-subscriptions'
import { SubscriptionRouteResponse } from './dto/subscription-route.response'
import { RouteFilterInput } from './dto/route-filter.input'
import { UserService } from '../user/user.service'
import { DeleteRouteInput } from './dto/delete-route.input'

const pubSub = new PubSub()

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
      pubSub.publish('routeChanged', { watchUserRoutes: emit })
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
    const { transit, difficulty, category } = filter || {}
    const routes = await this.routeModel.find({})
    const routesFiltered = routes.filter((route) => {
      if (transit && transit !== route.transit) return false
      else if (difficulty && difficulty !== route.difficulty) return false
      else if (category && category !== route.category) return false
      else return true
    })
    return routesFiltered
  }

  async getRoutesCount(filter: RouteFilterInput) {
    const { transit, difficulty, category } = filter || {}
    const routes = await this.routeModel.find({})
    const count = routes.reduce((count, route) => {
      if (transit && transit !== route.transit) return count
      else if (difficulty && difficulty !== route.difficulty) return count
      else if (category && category !== route.category) return count
      else return count + 1
    }, 0)
    return count
  }

  watchRoutes() {
    const res = pubSub.asyncIterator('routeChanged')
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
    this.pubSub.publish('routeChanged', { watchRoutes: emit })

    return `Успешно удален трек № ${id} `
  }

  async calcUserStatistics(userId: MongooSchema.Types.ObjectId) {
    const routes = await this.routeModel.find({ userId })

    const { duration, distance } =
      await this.trackService.calcUserTrackStatistics(userId)

    const res = {
      subscribers: 0,
      subscriptions: 0,
      routes: routes.length,
      duration,
      distance,
      points: routes.length * 50
    }
    return res
  }
}
