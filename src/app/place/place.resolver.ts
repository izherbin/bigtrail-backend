import { Resolver, Mutation, Args } from '@nestjs/graphql'
import { PlaceService } from './place.service'
import { Place } from './entities/place.entity'
import { CreatePlaceInput } from './dto/create-place.input'
// import { UpdatePlaceInput } from './dto/update-place.input'
import { UserId } from '../auth/user-id.decorator'
import { Schema as MongooSchema } from 'mongoose'
import { UploadPhoto } from '../track/dto/upload-photo.response'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'

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

  // @Query(() => [Place], { name: 'place' })
  // findAll() {
  //   return this.placeService.findAll()
  // }

  // @Query(() => Place, { name: 'place' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.placeService.findOne(id)
  // }

  // @Mutation(() => Place)
  // updatePlace(@Args('updatePlaceInput') updatePlaceInput: UpdatePlaceInput) {
  //   return this.placeService.update(updatePlaceInput.id, updatePlaceInput);
  // }

  // @Mutation(() => Place)
  // removePlace(@Args('id', { type: () => Int }) id: number) {
  //   return this.placeService.remove(id)
  // }
}
