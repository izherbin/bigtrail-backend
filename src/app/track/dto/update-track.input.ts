import { CreateTrackInput } from './create-track.input'
import { InputType, Field, PartialType } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType()
export class UpdateTrackInput extends PartialType(CreateTrackInput) {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  id: MongooSchema.Types.ObjectId
}
