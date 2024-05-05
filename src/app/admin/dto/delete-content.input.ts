import { InputType, Field } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType({ description: 'Информация для удаления контента' })
export class DeleteContentInput {
  @Field(() => String, { description: 'Тип контента: route или place' })
  type: 'route' | 'place'

  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  id: MongooSchema.Types.ObjectId
}
