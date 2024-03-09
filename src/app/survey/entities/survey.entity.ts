import { ObjectType, Field } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooSchema } from 'mongoose'

@ObjectType({ description: 'Вариант ответа на опрос' })
@Schema({ _id: false })
export class SurveyItem {
  @Field(() => String, { description: 'Название варианта ответа на опрос' })
  @Prop()
  name: string

  @Field(() => Boolean, {
    nullable: true,
    description: 'Есть ли собственный вариант ответа?'
  })
  @Prop()
  hasCustomString?: boolean
}

@ObjectType({ description: 'Опрос' })
@Schema()
export class Survey {
  @Field(() => String, { description: 'Идентификатор опроса в MongoDB' })
  _id: MongooSchema.Types.ObjectId

  @Field(() => String, { description: 'Название опроса' })
  @Prop()
  name: string

  @Field(() => [SurveyItem], { description: 'Варианты ответов на опрос' })
  @Prop()
  items: SurveyItem[]
}

export type SurveyDocument = Survey & Document
export const SurveySchema = SchemaFactory.createForClass(Survey)
