import { ObjectType, Field } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooSchema } from 'mongoose'

@ObjectType()
@Schema({ _id: false })
export class SurveyItem {
  @Field(() => String, { description: '' })
  @Prop()
  name: string

  @Field(() => Boolean, { nullable: true, description: '' })
  @Prop()
  hasCustomString?: boolean
}

@ObjectType()
@Schema()
export class Survey {
  @Field(() => String, { description: '' })
  _id: MongooSchema.Types.ObjectId

  @Field(() => String, { description: '' })
  @Prop()
  name: string

  @Field(() => [SurveyItem], { description: '' })
  @Prop()
  items: SurveyItem[]
}

export type SurveyDocument = Survey & Document
export const SurveySchema = SchemaFactory.createForClass(Survey)
