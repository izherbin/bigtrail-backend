import { Field, InputType } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType({ description: 'Данные для удаления ревью' })
export class DeleteReviewInput {
  @Field(() => String, {
    description: 'Тип контента'
  })
  type: string

  @Field(() => String, {
    description: 'Идентификатор контента'
  })
  id: MongooSchema.Types.ObjectId
}
