import { Module } from '@nestjs/common'
import { PlaceService } from './place.service'
import { PlaceResolver } from './place.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { Place, PlaceSchema } from './entities/place.entity'
import { MinioClientModule } from '../minio-client/minio-client.module'
import { TrackModule } from '../track/track.module'
import { UserModule } from '../user/user.module'
import { ConfigModule } from '@nestjs/config'
import { FavoritesModule } from '../favorites/favorites.module'

@Module({
  providers: [PlaceResolver, PlaceService],
  imports: [
    MongooseModule.forFeature([{ name: Place.name, schema: PlaceSchema }]),
    ConfigModule.forRoot({
      cache: true
    }),
    MinioClientModule,
    FavoritesModule,
    TrackModule,
    UserModule
  ],
  exports: [PlaceService]
})
export class PlaceModule {}
