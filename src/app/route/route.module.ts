import { Module } from '@nestjs/common'
import { RouteService } from './route.service'
import { RouteResolver } from './route.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { MinioClientModule } from '../minio-client/minio-client.module'
import { TrackModule } from '../track/track.module'
import { Route, RouteSchema } from './entities/route.entity'
import { UserModule } from '../user/user.module'
import { ConfigModule } from '@nestjs/config'
import { FavoritesModule } from '../favorites/favorites.module'
import { NotificationModule } from '../notification/notification.module'

@Module({
  providers: [RouteResolver, RouteService],
  imports: [
    MongooseModule.forFeature([{ name: Route.name, schema: RouteSchema }]),
    ConfigModule.forRoot({
      cache: true
    }),
    FavoritesModule,
    MinioClientModule,
    TrackModule,
    NotificationModule,
    UserModule
  ],
  exports: [RouteService]
})
export class RouteModule {}
