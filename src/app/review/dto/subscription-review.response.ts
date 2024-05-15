import { Field, ObjectType } from '@nestjs/graphql'
import { WatchResponseFunction } from 'src/app/track/dto/subscription-track.response'
import { Schema as MongooSchema } from 'mongoose'
import { Review } from '../entities/review.entity'

@ObjectType({ description: 'Информация от подписки на изменения ревью' })
export class SubscriptionReviewResponse {
  @Field(() => String, {
    description: 'Метод изменения ревью'
  })
  function: WatchResponseFunction

  @Field(() => String, {
    description: 'Идентификатор ревью'
  })
  id: MongooSchema.Types.ObjectId

  @Field(() => Review, {
    nullable: true,
    description: 'Данные изменения ревью'
  })
  data?: Review
}
