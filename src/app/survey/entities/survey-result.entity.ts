import { ObjectType, Field } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooSchema } from 'mongoose'

@ObjectType({ description: 'Ответ на опрос' })
@Schema()
export class SurveyResult {
  @Field(() => String, {
    description: 'Идентификатор ответа на опрос в MongoDB'
  })
  _id: MongooSchema.Types.ObjectId

  @Field(() => String, { description: 'Ссылка на опрос в MongoDB' })
  @Prop()
  surveyId: MongooSchema.Types.ObjectId

  @Field(() => String, { description: 'Строка ответа на опрос' })
  @Prop()
  response: string
}

export type SurveyResultDocument = SurveyResult & Document
export const SurveyResultSchema = SchemaFactory.createForClass(SurveyResult)
