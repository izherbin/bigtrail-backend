import { InputType, Field } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType()
export class DeleteTrackInput {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  id: MongooSchema.Types.ObjectId
}
