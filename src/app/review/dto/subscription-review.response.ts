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
    description: 'Тип контента'
  })
  type: 'route' | 'place'

  @Field(() => String, {
    description: 'Идентификатор контента'
  })
  contentId: MongooSchema.Types.ObjectId

  @Field(() => String, { description: 'Идентификатор владельца ревью' })
  userId: MongooSchema.Types.ObjectId

  @Field(() => Review, {
    nullable: true,
    description: 'Данные изменения ревью'
  })
  data?: Review
}
