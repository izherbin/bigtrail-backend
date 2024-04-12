import { Field, ObjectType } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'
import { WatchResponseFunction } from 'src/app/track/dto/subscription-track.response'
import { Favorite } from 'src/app/user/entities/user.entity'

@ObjectType({
  description: 'Информация от подписки на изменения списка избранного'
})
export class SubscriptionFavoriteResponse {
  @Field(() => String, {
    description: 'Метод изменения списка избранного'
  })
  function: WatchResponseFunction

  @Field(() => Favorite, {
    description: 'Элемент списка избранного'
  })
  data: Favorite

  userId: MongooSchema.Types.ObjectId
}
