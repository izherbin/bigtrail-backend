import { Module } from '@nestjs/common'
import { TrackService } from './track.service'
import { TrackResolver } from './track.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { Track, TrackSchema } from './entities/track.entity'

@Module({
  providers: [TrackResolver, TrackService],
  imports: [
    MongooseModule.forFeature([{ name: Track.name, schema: TrackSchema }])
  ]
})
export class TrackModule {}
