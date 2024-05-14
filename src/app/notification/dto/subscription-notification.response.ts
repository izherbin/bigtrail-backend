import { Field, ObjectType } from '@nestjs/graphql'
import { WatchResponseFunction } from 'src/app/track/dto/subscription-track.response'
import { Schema as MongooSchema } from 'mongoose'

@ObjectType({ description: 'Информация от подписки на изменения уведомлении' })
export class SubscriptionNotificationResponse {
  @Field(() => String, {
    description: 'Метод изменения уведомления'
  })
  function: WatchResponseFunction

  @Field(() => String, {
    description: 'Идентификатор уведомления'
  })
  id: MongooSchema.Types.ObjectId

  @Field(() => Notification, {
    description: 'Данные изменения уведомления',
    nullable: true
  })
  data?: Notification

  userId: MongooSchema.Types.ObjectId
}
