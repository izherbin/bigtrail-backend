import { Field, InputType } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType({ description: 'Данные для показа ревью' })
export class GetReviewsInput {
  @Field(() => String, {
    description: 'Тип контента'
  })
  type: 'route' | 'place'

  @Field(() => String, {
    description: 'Идентификатор контента'
  })
  contentId: MongooSchema.Types.ObjectId
}
