import { InputType, Field } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType({ description: 'Информация об удаляемом треке' })
export class DeleteTrackInput {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  id: MongooSchema.Types.ObjectId
}
