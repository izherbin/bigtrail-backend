import { ObjectType, Field } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooSchema } from 'mongoose'

@ObjectType({ description: 'Этап сценария тестирования' })
@Schema({ _id: false })
export class ScenarioItem {
  @Field(() => String, { description: 'Название этапа сценария тестирования' })
  @Prop()
  name: string
}

@ObjectType({ description: 'Сценарий тестирования' })
@Schema()
export class Scenario {
  @Field(() => String, { description: 'Идентификатор опроса в MongoDB' })
  _id: MongooSchema.Types.ObjectId

  @Field(() => String, { description: 'Название сценария тестирования' })
  @Prop()
  name: string

  @Field(() => [ScenarioItem], { description: 'Этапы сценария тестирования' })
  @Prop()
  items: ScenarioItem[]
}

export type ScenarioDocument = Scenario & Document
export const ScenarioSchema = SchemaFactory.createForClass(Scenario)
