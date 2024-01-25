import { Module } from '@nestjs/common'
import { TrackService } from './track.service'
import { TrackResolver } from './track.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { Track, TrackSchema } from './entities/track.entity'
import { MinioClientModule } from '../minio-client/minio-client.module'

@Module({
  providers: [TrackResolver, TrackService],
  imports: [
    MongooseModule.forFeature([{ name: Track.name, schema: TrackSchema }]),
    MinioClientModule
  ],
  exports: [TrackService]
})
export class TrackModule {}
