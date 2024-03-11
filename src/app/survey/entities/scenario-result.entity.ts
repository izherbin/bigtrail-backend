import { ObjectType, Field } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooSchema } from 'mongoose'

@ObjectType({ description: 'Результат выполнения сценария тестирования' })
@Schema()
export class ScenarioResult {
  @Field(() => String, {
    description:
      'Идентификатор результата выполнения сценария тестирования в MongoDB'
  })
  _id: MongooSchema.Types.ObjectId

  @Field(() => String, {
    description: 'Ссылка на сценарий тестирования в MongoDB'
  })
  @Prop()
  scenarioId: MongooSchema.Types.ObjectId

  @Field(() => String, { nullable: true, description: 'Предложение' })
  @Prop()
  suggestion?: string

  @Field(() => String, { nullable: true, description: 'Обнаруженные баги' })
  @Prop()
  bugs?: string

  @Field(() => String, { nullable: true, description: 'Похвала' })
  @Prop()
  friendly?: string

  @Field(() => String, { description: 'Невозможность воспроизвести баг' })
  @Prop()
  reproduce?: string
}

export type ScenarioResultDocument = ScenarioResult & Document
export const ScenarioResultSchema = SchemaFactory.createForClass(ScenarioResult)
