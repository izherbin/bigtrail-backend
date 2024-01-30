import { ObjectType, Field, Float } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooSchema } from 'mongoose'

@ObjectType({ description: 'Точка на маршруте' })
@Schema({ _id: false })
export class TrackPoint {
  @Field(() => Float, { description: 'Широта' })
  @Prop()
  lat: number

  @Field(() => Float, { description: 'Долгота' })
  @Prop()
  lon: number

  @Field(() => Float, { nullable: true, description: 'Высота' })
  @Prop()
  alt?: number

  @Field(() => Float, { nullable: true, description: 'Временная метка' })
  @Prop()
  timestamp?: number

  @Field(() => Float, { nullable: true, description: 'Скорость' })
  @Prop()
  speed?: number

  @Field(() => Float, { nullable: true, description: 'Ускорение' })
  @Prop()
  boost?: number

  @Field(() => Float, { nullable: true, description: 'Вертикальная скорость' })
  @Prop()
  altSpeed?: number
}

@ObjectType({ description: 'Фотография в треке' })
@Schema({ _id: false })
export class TrackPhoto {
  @Field(() => String, { nullable: true, description: 'Сыылка на фото' })
  @Prop()
  uri?: string

  @Prop()
  filename?: string

  @Field(() => String, { nullable: true, description: 'Описание' })
  @Prop()
  description?: string

  @Field(() => String, {
    nullable: true,
    description: 'id локальный для фронта'
  })
  @Prop()
  id?: string
}

@ObjectType({ description: 'Заметка в треке' })
@Schema({ _id: false })
export class TrackNote {
  @Field(() => TrackPoint, { description: 'Точка трека' })
  @Prop()
  point: TrackPoint

  @Field(() => String, { description: 'id локальный для фронта' })
  @Prop()
  id: string

  @Field(() => String, { nullable: true, description: 'Описание' })
  @Prop()
  description?: string

  @Field(() => [TrackPhoto], {
    nullable: true,
    description: 'Набор фотографий'
  })
  @Prop()
  photos?: TrackPhoto[]

  @Field(() => Boolean, { nullable: true, description: 'Нерабочее?' })
  @Prop()
  disabled?: boolean
}

@ObjectType({ description: 'Трек' })
@Schema()
export class Track {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  _id: MongooSchema.Types.ObjectId

  @Field(() => String, { description: 'Тип, по умолчанию track' })
  @Prop({ default: 'track' })
  type: string

  @Field(() => String, { description: 'id локальный для фронта' })
  id: string

  @Field(() => String, { description: 'id создателя' })
  @Prop()
  userId: MongooSchema.Types.ObjectId

  @Field(() => String, { description: 'Имя трека' })
  @Prop()
  name: string

  @Field(() => Float, { description: 'Временная метка' })
  @Prop()
  timestamp: number

  @Field(() => [TrackPoint], { description: 'Массив точек трека' })
  @Prop()
  points: TrackPoint[]

  @Field(() => Float, { nullable: true, description: 'Длительность' })
  @Prop()
  duration?: number

  @Field(() => Float, { nullable: true, description: 'Расстояние' })
  @Prop()
  distance?: number

  @Field(() => [TrackNote], {
    nullable: true,
    description: 'Заметки о точках трека'
  })
  @Prop()
  notes?: TrackNote[]

  @Field(() => String, { nullable: true, description: 'Адрес' })
  @Prop()
  address?: string

  @Field(() => Boolean, { nullable: true, description: 'Нерабочее?' })
  @Prop()
  disabled?: boolean
}

export type TrackDocument = Track & Document
export const TrackSchema = SchemaFactory.createForClass(Track)
