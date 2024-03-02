import { InputType, Field } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType({ description: 'Информация для удаления интересного места' })
export class DeletePlaceInput {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  id: MongooSchema.Types.ObjectId
}
