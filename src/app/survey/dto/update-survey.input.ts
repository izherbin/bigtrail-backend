import { CreateSurveyInput } from './create-survey.input'
import { InputType, Field, PartialType } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType()
export class UpdateSurveyInput extends PartialType(CreateSurveyInput) {
  @Field(() => String)
  id: MongooSchema.Types.ObjectId
}
