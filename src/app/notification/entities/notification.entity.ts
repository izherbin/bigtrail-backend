import { ObjectType, Field, Float } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooSchema } from 'mongoose'

export type Event = 'ADD' | 'DELETE' | 'UPDATE' | 'MODERATE' | 'VERIFY'
@ObjectType({ description: 'Уведомление пользователя' })
@Schema()
export class Notification {
  @Field(() => String, { description: 'Идентификатор в MongoDB' })
  _id: MongooSchema.Types.ObjectId

  @Field(() => String, { description: 'Id адресата' })
  @Prop()
  userId: MongooSchema.Types.ObjectId

  @Field(() => String, {
    nullable: true,
    description: 'Тип контента'
  })
  @Prop()
  type?: 'route' | 'place'

  @Field(() => String, {
    nullable: true,
    description: 'Идентификатор контента'
  })
  @Prop()
  contentId?: MongooSchema.Types.ObjectId

  @Field(() => Float, {
    description: 'Время создания уведомления'
  })
  @Prop()
  tsCreated: number

  @Field(() => String, {
    nullable: true,
    description: 'Имя уведомления'
  })
  @Prop()
  title?: string

  @Field(() => String, {
    nullable: true,
    description: 'Текст уведомления'
  })
  @Prop()
  text?: string

  @Field(() => String, { description: 'Тип события' })
  @Prop()
  event: Event

  @Field(() => Boolean, {
    nullable: true,
    description: 'Признак прочтенности уведомления'
  })
  @Prop({ default: false })
  viewed?: boolean
}

export type NotificationDocument = Notification & Document
export const NotificationSchema = SchemaFactory.createForClass(Notification)
