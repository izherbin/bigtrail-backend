import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from './entities/user.entity'
import { ConfigModule } from '@nestjs/config'
import { UserResolver } from './user.resolver'
import { MinioClientModule } from '../minio-client/minio-client.module'
import { RouteModule } from '../route/route.module'

@Module({
  providers: [UserService, UserResolver],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule.forRoot({
      cache: true
    }),
    MinioClientModule,
    RouteModule
  ],
  exports: [UserService]
})
export class UserModule {}
