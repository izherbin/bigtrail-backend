import { Field, ObjectType } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'
import { WatchResponseFunction } from 'src/app/track/dto/subscription-track.response'
import { Place } from '../entities/place.entity'

@ObjectType({
  description: 'Информация от подписки на изменения интересного места'
})
export class SubscriptionPlaceResponse {
  @Field(() => String, {
    description: 'Метод изменения интересного места'
  })
  function: WatchResponseFunction

  @Field(() => String, {
    description: 'Идентификатор интересного места'
  })
  id: MongooSchema.Types.ObjectId

  @Field(() => Place, {
    description: 'Данные изменения интересного места',
    nullable: true
  })
  data?: Place

  userId: MongooSchema.Types.ObjectId
}
