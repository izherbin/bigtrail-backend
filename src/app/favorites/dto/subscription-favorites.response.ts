import { Field, ObjectType } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'
import { WatchResponseFunction } from 'src/app/track/dto/subscription-track.response'

@ObjectType({
  description: 'Информация от подписки на изменения списка избранного'
})
export class SubscriptionFavoriteResponse {
  @Field(() => String, {
    description: 'Метод изменения списка избранного'
  })
  function: WatchResponseFunction

  @Field(() => String, {
    description: 'Идентификатор избранного'
  })
  id: string

  userId: MongooSchema.Types.ObjectId
}
