import { Module, forwardRef } from '@nestjs/common'
import { UserService } from './user.service'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from './entities/user.entity'
import { ConfigModule } from '@nestjs/config'
import { UserResolver } from './user.resolver'
import { MinioClientModule } from '../minio-client/minio-client.module'
import { RouteModule } from '../route/route.module'
import { TrackModule } from '../track/track.module'
import { PubSub } from 'graphql-subscriptions'

@Module({
  providers: [
    UserService,
    UserResolver,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub()
    }
  ],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule.forRoot({
      cache: true
    }),
    MinioClientModule,
    forwardRef(() => RouteModule),
    forwardRef(() => TrackModule)
  ],
  exports: [UserService, 'PUB_SUB']
})
export class UserModule {}
