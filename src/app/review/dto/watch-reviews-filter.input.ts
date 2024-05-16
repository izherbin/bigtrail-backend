import { InputType, Field } from '@nestjs/graphql'
import { Types } from 'mongoose'

@InputType({
  description: 'Набор фильтров для отслеживания изменений ревью'
})
export class WatchReviewsFilterInput {
  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по автору ревью'
  })
  userId?: Types.ObjectId
}
