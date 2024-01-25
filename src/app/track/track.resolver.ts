import { Resolver, Mutation, Args, Query, Subscription } from '@nestjs/graphql'
import { TrackService } from './track.service'
import { Track } from './entities/track.entity'
import { CreateTrackInput } from './dto/create-track.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { UserId } from '../auth/user-id.decorator'
import { Schema as MongooSchema } from 'mongoose'
import { DeleteTrackInput } from './dto/delete-track.input'
import { SubscriptionTrackResponse } from './dto/subscription-track.response'
import { Photo } from './dto/photo.response'
// import { UpdateTrackInput } from './dto/update-track.input'

@Resolver()
export class TrackResolver {
  constructor(private readonly trackService: TrackService) {}

  @Mutation(() => [Photo], {
    description: 'Загрузить трек в MongoDB'
  })
  @UseGuards(JwtAuthGuard)
  uploadTrack(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('createTrackInput') createTrackInput: CreateTrackInput
  ) {
    return this.trackService.create(userId, createTrackInput)
  }

  @Query(() => [Track], {
    name: 'getAllTracks',
    description: 'Получить все треки пользователя'
  })
  @UseGuards(JwtAuthGuard)
  getAllTracksQuery(@UserId() userId: MongooSchema.Types.ObjectId) {
    return this.trackService.findByUserId(userId)
  }

  @Subscription(() => SubscriptionTrackResponse, {
    description: 'Следить за всеми треками пользователя',
    filter: (payload, variables, context): boolean => {
      const res = payload.watchTracks.userId.toString() === context.req.user._id
      console.log('My userId:', context.req.user._id)
      console.log('Changed userId:', payload.watchTracks.userId.toString())
      return res
    }
  })
  @UseGuards(JwtAuthGuard)
  watchTracks(@UserId() userId: MongooSchema.Types.ObjectId) {
    console.log('userId:', userId)
    const res = this.trackService.watchTracks()
    return res
  }

  // @Query(() => [Track], { name: 'track' })
  // findAll() {
  //   return this.trackService.findAll()
  // }

  // @Query(() => Track, { name: 'track' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.trackService.findOne(id)
  // }

  // @Mutation(() => Track)
  // updateTrack(@Args('updateTrackInput') updateTrackInput: UpdateTrackInput) {
  //   return this.trackService.update(updateTrackInput.id, updateTrackInput)
  // }

  @Mutation(() => String, {
    description: 'Удалить трек из MongoDB'
  })
  @UseGuards(JwtAuthGuard)
  deleteTrack(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('deleteTrackInput') deleteTrackInput: DeleteTrackInput
  ) {
    return this.trackService.remove(userId, deleteTrackInput)
  }
}
