import { CreateTrackInput } from './create-track.input'
import { InputType, Field, PartialType } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType({ description: 'Информация для редактирования трека' })
export class UpdateTrackInput extends PartialType(CreateTrackInput) {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  _id: MongooSchema.Types.ObjectId
}
