import { Resolver, Mutation, Args, Query, Subscription } from '@nestjs/graphql'
import { PlaceService } from './place.service'
import { Place } from './entities/place.entity'
import { CreatePlaceInput } from './dto/create-place.input'
//? import { UpdatePlaceInput } from './dto/update-place.input'
import { UserId } from '../auth/user-id.decorator'
import { Schema as MongooSchema } from 'mongoose'
import { UploadPhoto } from '../track/dto/upload-photo.response'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { DeletePlaceInput } from './dto/delete-place.input'
import { PlaceFilterInput } from './dto/place-filter.input'
import { SubscriptionPlaceResponse } from './dto/subscription-place.response'
import { SubscriptionPlaceInput } from './dto/subscription-place.input'
import { GetPlaceInput } from './dto/get-place.input'
import { JwtFreeGuard } from '../auth/jwt-free.guards'

@Resolver(() => Place)
export class PlaceResolver {
  constructor(private readonly placeService: PlaceService) {}

  @Mutation(() => [UploadPhoto], {
    description: 'Загрузить трек в MongoDB'
  })
  @UseGuards(JwtAuthGuard)
  publishPlace(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('createPlaceInput') createPlaceInput: CreatePlaceInput
  ) {
    return this.placeService.create(userId, createPlaceInput)
  }

  @Query(() => Place, {
    deprecationReason:
      'This query is deprecated, use getContent({filter: id}) instead',
    description: 'Получить чужое интересное место по id'
  })
  @UseGuards(JwtFreeGuard)
  getPlace(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('getPlaceInput') getPlaceInput: GetPlaceInput
  ) {
    return this.placeService.getPlace(userId, getPlaceInput)
  }

  @Query(() => [Place], {
    description: 'Получить все интересные места, удовлетворяющие фильтру'
  })
  @UseGuards(JwtFreeGuard)
  getContent(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('placeFilterInput', { nullable: true })
    placeFilterInput?: PlaceFilterInput
  ) {
    return this.placeService.getContent(userId, placeFilterInput)
  }

  @Subscription(() => SubscriptionPlaceResponse, {
    description: 'Следить за всеми интересными местами заданного пользователя',
    filter: (payload, variables, context): boolean => {
      const userId = variables.subscriptionPlaceInput.userId
        ? variables.subscriptionPlaceInput.userId.toString()
        : context.req.user._id

      const res = payload.watchPlaces.userId.toString() === userId
      console.log('Watch place: userId:', userId)
      console.log('Watch place: My userId:', context.req.user._id)
      console.log(
        'Watch place: Changed userId:',
        payload.watchPlaces.userId.toString()
      )
      return res
    }
  })
  @UseGuards(JwtAuthGuard)
  watchPlaces(
    @Args('subscriptionPlaceInput')
    subscriptionPlaceInput: SubscriptionPlaceInput
  ) {
    const { userId } = subscriptionPlaceInput
    console.log('Watch place: Input userId:', userId)
    const res = this.placeService.watchPlaces()
    return res
  }

  @Mutation(() => String, {
    description: 'Удалить интересное место из MongoDB'
  })
  @UseGuards(JwtAuthGuard)
  deletePlace(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('deletePlaceInput') deletePlaceInput: DeletePlaceInput
  ) {
    return this.placeService.remove(userId, deletePlaceInput)
  }
}
