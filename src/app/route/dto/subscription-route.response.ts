import { Field, ObjectType } from '@nestjs/graphql'
import { Route } from '../entities/route.entity'
import { Schema as MongooSchema } from 'mongoose'
import { WatchResponseFunction } from 'src/app/track/dto/subscription-track.response'

@ObjectType({ description: 'Информация от подписки на изменения маршрута' })
export class SubscriptionRouteResponse {
  @Field(() => String, {
    description: 'Метод изменения маршрута'
  })
  function: WatchResponseFunction

  @Field(() => String, {
    description: 'Идентификатор маршрута'
  })
  id: MongooSchema.Types.ObjectId

  @Field(() => Route, {
    description: 'Данные изменения маршрута',
    nullable: true
  })
  data?: Route

  userId: MongooSchema.Types.ObjectId
}
