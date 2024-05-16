import { Resolver, Mutation, Args, Query, Subscription } from '@nestjs/graphql'
import { PlaceService } from './place.service'
import { Place } from './entities/place.entity'
import { CreatePlaceInput } from './dto/create-place.input'
import { UserId } from '../auth/user-id.decorator'
import { Schema as MongooSchema, Types } from 'mongoose'
import { UploadPhoto } from '../track/dto/upload-photo.response'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { DeletePlaceInput } from './dto/delete-place.input'
import { PlaceFilterInput } from './dto/place-filter.input'
import { SubscriptionPlaceResponse } from './dto/subscription-place.response'
import { WatchPlacesFilterInput } from './dto/watch-places-filter.input'
import { GetPlaceInput } from './dto/get-place.input'
import { JwtFreeGuard } from '../auth/jwt-free.guards'
import { EditPlaceInput } from './dto/edit-place.input'
import { RequiredRoles } from '../auth/required-roles.decorator'
import { Role } from '../user/entities/user.entity'
import { RolesGuard } from '../auth/roles.guards'
import { SetModeratedPlaceInput } from './dto/set-moderated-place.input'
import { SetVerifiedPlaceInput } from './dto/set-verified-place.input'

@Resolver(() => Place)
export class PlaceResolver {
  constructor(private readonly placeService: PlaceService) {}

  @Mutation(() => [UploadPhoto], {
    description: 'Загрузить интересное место в MongoDB'
  })
  @UseGuards(JwtAuthGuard)
  publishPlace(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('createPlaceInput') createPlaceInput: CreatePlaceInput
  ) {
    return this.placeService.create(userId, createPlaceInput)
  }

  @Mutation(() => [UploadPhoto], {
    description: 'Редактировать интересное место из MongoDB'
  })
  @UseGuards(JwtAuthGuard)
  editPlace(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('editPlaceInput') editPlaceInput: EditPlaceInput
  ) {
    return this.placeService.edit(userId, editPlaceInput)
  }

  @Mutation(() => String, {
    description: 'Модерировать интересное место'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Moderator)
  setModeratedPlace(
    @Args('setModeratedPlaceInput')
    setModeratedPlaceInput: SetModeratedPlaceInput
  ) {
    return this.placeService.setModerated(setModeratedPlaceInput)
  }

  @Mutation(() => String, {
    description: 'Верифицировать интересное место'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Verifier)
  setVerifiedPlace(
    @Args('setVerifiedPlaceInput')
    setVerifiedPlaceInput: SetVerifiedPlaceInput
  ) {
    return this.placeService.setVerified(setVerifiedPlaceInput)
  }

  @Query(() => Place, {
    deprecationReason:
      'This query is deprecated, use getPlaces({filter: id}) instead',
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
  getPlaces(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('placeFilterInput', { nullable: true })
    placeFilterInput?: PlaceFilterInput
  ) {
    return this.placeService.getPlaces(userId, placeFilterInput)
  }

  @Subscription(() => SubscriptionPlaceResponse, {
    description:
      'Следить за всеми интересными местами заданного пользователя, удовлетворяющих фильтру',
    filter: (payload, variables): boolean => {
      const { ids } = variables.watchPlacesFilterInput
      const passedIdFilter =
        !ids ||
        !Array.isArray(ids) ||
        ids.length == 0 ||
        ids.some(
          (id: Types.ObjectId) =>
            id.toString() === payload.watchPlaces.id.toString()
        )

      const passedUserIdFilter =
        !variables.watchPlacesFilterInput.userId ||
        payload.watchPlaces.userId.toString() ===
          variables.watchPlacesFilterInput.userId.toString()
      return passedIdFilter && passedUserIdFilter
    }
  })
  watchPlaces(
    @Args('watchPlacesFilterInput', { nullable: true })
    filter: WatchPlacesFilterInput
  ) {
    console.log('Watch place: Input filter:', filter)
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
