import {
  Resolver,
  Query,
  Mutation,
  Args,
  Subscription,
  Int
} from '@nestjs/graphql'
import { RouteService } from './route.service'
import { Route } from './entities/route.entity'
import { CreateRouteInput } from './dto/create-route.input'
// import { UpdateRouteInput } from './dto/update-route.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { UploadPhoto } from '../track/dto/upload-photo.response'
import { UserId } from '../auth/user-id.decorator'
import { Schema as MongooSchema } from 'mongoose'
import { SubscriptionRouteResponse } from './dto/subscription-route.response'
import { RouteFilterInput } from './dto/route-filter.input'
import { DeleteRouteInput } from './dto/delete-route.input'
import { GetRouteInput } from './dto/get-route.input'
import { GetElevationInput } from './dto/get-elevation.input'

@Resolver(() => Route)
export class RouteResolver {
  constructor(private readonly routeService: RouteService) {}

  @Mutation(() => [UploadPhoto], {
    description: 'Загрузить маршрут в MongoDB'
  })
  @UseGuards(JwtAuthGuard)
  publishRoute(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('createRouteInput') createRouteInput: CreateRouteInput
  ) {
    return this.routeService.create(userId, createRouteInput)
  }

  @Query(() => [Route], {
    description: 'Получить все маршруты пользователя'
  })
  @UseGuards(JwtAuthGuard)
  getUserRoutes(@UserId() userId: MongooSchema.Types.ObjectId) {
    return this.routeService.getUserRoutes(userId)
  }

  @Query(() => [Route], {
    description: 'Получить все маршруты, удовлетворяющие фильтру'
  })
  getRoutes(
    @Args('routeFilterInput', { nullable: true })
    routeFilterInput?: RouteFilterInput
  ) {
    return this.routeService.getRoutes(routeFilterInput)
  }

  @Query(() => Route, {
    description: 'Получить чужой маршрут по id'
  })
  getRoute(
    @Args('getRouteInput')
    getRouteInput: GetRouteInput
  ) {
    return this.routeService.getRoute(getRouteInput)
  }

  @Query(() => Int, {
    description: 'Получить количество всех маршрутов, удовлетворяющих фильтру'
  })
  getRoutesCount(
    @Args('routeFilterInput', { nullable: true })
    routeFilterInput?: RouteFilterInput
  ) {
    return this.routeService.getRoutesCount(routeFilterInput)
  }

  @Subscription(() => SubscriptionRouteResponse, {
    description: 'Следить за всеми маршрутами пользователя',
    filter: (payload, variables, context): boolean => {
      const res =
        payload.watchUserRoutes.userId.toString() === context.req.user._id
      console.log('My userId:', context.req.user._id)
      console.log('Changed userId:', payload.watchUserRoutes.userId.toString())
      return res
    }
  })
  @UseGuards(JwtAuthGuard)
  watchUserRoutes(@UserId() userId: MongooSchema.Types.ObjectId) {
    console.log('userId:', userId)
    const res = this.routeService.watchUserRoutes()
    return res
  }

  // @Query(() => Route, { name: 'route' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.routeService.findOne(id)
  // }

  // @Mutation(() => Route)
  // updateRoute(@Args('updateRouteInput') updateRouteInput: UpdateRouteInput) {
  //   return this.routeService.update(updateRouteInput.id, updateRouteInput)
  // }

  // @Mutation(() => Route)
  // removeRoute(@Args('id', { type: () => Int }) id: number) {
  //   return this.routeService.remove(id)
  // }

  @Mutation(() => String, {
    description: 'Удалить маршрут из MongoDB'
  })
  @UseGuards(JwtAuthGuard)
  deleteRoute(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('deleteRouteInput') deleteRouteInput: DeleteRouteInput
  ) {
    return this.routeService.remove(userId, deleteRouteInput)
  }

  @Query(() => String, {
    description: 'Получить высоту по координатам'
  })
  async getElevation(
    @Args('getElevationInput')
    getElevationInput: GetElevationInput
  ) {
    const { lat, lon } = getElevationInput
    const elev = await this.routeService.getElevation(lat, lon)
    return `The elevation at (${lat.toFixed(6)},${lon.toFixed(6)}) is ${elev} m`
  }
}
