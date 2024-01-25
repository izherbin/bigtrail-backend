import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql'
import { RouteService } from './route.service'
import { Route } from './entities/route.entity'
import { CreateRouteInput } from './dto/create-route.input'
// import { UpdateRouteInput } from './dto/update-route.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { Photo } from '../track/dto/photo.response'
import { UserId } from '../auth/user-id.decorator'
import { Schema as MongooSchema } from 'mongoose'
import { SubscriptionRouteResponse } from './dto/subscription-route.response'

@Resolver(() => Route)
export class RouteResolver {
  constructor(private readonly routeService: RouteService) {}

  @Mutation(() => [Photo], {
    description: 'Загрузить маршрут в MongoDB'
  })
  @UseGuards(JwtAuthGuard)
  createRoute(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('createRouteInput') createRouteInput: CreateRouteInput
  ) {
    return this.routeService.create(userId, createRouteInput)
  }

  @Query(() => [Route], { name: 'getAllRoutes' })
  @UseGuards(JwtAuthGuard)
  getAllRoutesQuery(@UserId() userId: MongooSchema.Types.ObjectId) {
    return this.routeService.findByUserId(userId)
  }

  @Subscription(() => SubscriptionRouteResponse, {
    description: 'Следить за всеми маршрутами пользователя',
    filter: (payload, variables, context): boolean => {
      const res = payload.watchRoutes.userId.toString() === context.req.user._id
      console.log('My userId:', context.req.user._id)
      console.log('Changed userId:', payload.watchRoutes.userId.toString())
      return res
    }
  })
  @UseGuards(JwtAuthGuard)
  watchRoutes(@UserId() userId: MongooSchema.Types.ObjectId) {
    console.log('userId:', userId)
    const res = this.routeService.watchRoutes()
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
}
