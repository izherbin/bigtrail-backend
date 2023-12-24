import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from '../auth/entities/user.entity'
import { ConfigModule } from '@nestjs/config'
import { UserResolver } from './user.resolver'

@Module({
  providers: [UserService, UserResolver],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule.forRoot({
      cache: true
    })
  ],
  exports: [UserService]
})
export class UserModule {}
