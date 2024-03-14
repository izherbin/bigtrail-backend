import { Module } from '@nestjs/common'
import { TrackService } from './track.service'
import { TrackResolver } from './track.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { Track, TrackSchema } from './entities/track.entity'
import { MinioClientModule } from '../minio-client/minio-client.module'
import { UserModule } from '../user/user.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  providers: [TrackResolver, TrackService],
  imports: [
    MongooseModule.forFeature([{ name: Track.name, schema: TrackSchema }]),
    ConfigModule.forRoot({
      cache: true
    }),
    MinioClientModule,
    UserModule
  ],
  exports: [TrackService]
})
export class TrackModule {}
