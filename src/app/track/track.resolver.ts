import { Resolver, Mutation, Args } from '@nestjs/graphql'
import { TrackService } from './track.service'
import { Track } from './entities/track.entity'
import { CreateTrackInput } from './dto/create-track.input'
// import { UpdateTrackInput } from './dto/update-track.input'

@Resolver(() => Track)
export class TrackResolver {
  constructor(private readonly trackService: TrackService) {}

  @Mutation(() => Track)
  uploadTrack(@Args('createTrackInput') createTrackInput: CreateTrackInput) {
    return this.trackService.create(createTrackInput)
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
