import { Resolver, Mutation, Args } from '@nestjs/graphql'
import { TrackService } from './track.service'
import { Track } from './entities/track.entity'
import { CreateTrackInput } from './dto/create-track.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { UserId } from '../auth/user-id.decorator'
import { Schema as MongooSchema } from 'mongoose'
// import { UpdateTrackInput } from './dto/update-track.input'

@Resolver(() => Track)
export class TrackResolver {
  constructor(private readonly trackService: TrackService) {}

  @Mutation(() => Track)
  @UseGuards(JwtAuthGuard)
  uploadTrack(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('createTrackInput') createTrackInput: CreateTrackInput
  ) {
    return this.trackService.create(userId, createTrackInput)
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

  // @Mutation(() => Track)
  // removeTrack(@Args('id', { type: () => Int }) id: number) {
  //   return this.trackService.remove(id)
  // }
}
