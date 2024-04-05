import { Module } from '@nestjs/common'
import { FavoritesService } from './favorites.service'
import { FavoritesResolver } from './favorites.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from '../user/entities/user.entity'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserModule
  ],
  providers: [FavoritesResolver, FavoritesService],
  exports: [FavoritesService]
})
export class FavoritesModule {}
