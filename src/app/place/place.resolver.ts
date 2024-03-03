import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'
import { PlaceService } from './place.service'
import { Place } from './entities/place.entity'
import { CreatePlaceInput } from './dto/create-place.input'
// import { UpdatePlaceInput } from './dto/update-place.input'
import { UserId } from '../auth/user-id.decorator'
import { Schema as MongooSchema } from 'mongoose'
import { UploadPhoto } from '../track/dto/upload-photo.response'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { GetPlaceInput } from './dto/get-place.input'
import { DeletePlaceInput } from './dto/delete-place.input'
import { PlaceFilterInput } from './dto/place-filter.input'

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
    description: 'Получить чужое интересное место по id'
  })
  getPlace(
    @Args('getPlaceInput')
    getPlaceInput: GetPlaceInput
  ) {
    return this.placeService.getPlace(getPlaceInput)
  }

  @Query(() => [Place], {
    description: 'Получить все интересные места, удовлетворяющие фильтру'
  })
  getContent(
    @Args('placeFilterInput', { nullable: true })
    placeFilterInput?: PlaceFilterInput
  ) {
    return this.placeService.getContent(placeFilterInput)
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

  // @Mutation(() => Place)
  // removePlace(@Args('id', { type: () => Int }) id: number) {
  //   return this.placeService.remove(id)
  // }
}
