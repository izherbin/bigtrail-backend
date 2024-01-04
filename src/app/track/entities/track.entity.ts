import { ObjectType, Field, Float } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooSchema } from 'mongoose'

@ObjectType()
@Schema({ _id: false })
export class TrackPoint {
  @Field(() => Float, { description: 'Широта' })
  @Prop()
  lat: number

  @Field(() => Float, { description: 'Долгота' })
  @Prop()
  lon: number

  @Field(() => Float, { description: 'Высота' })
  @Prop()
  alt?: number

  @Field(() => Float, { description: 'Временная метка' })
  @Prop()
  timestamp?: number

  @Field(() => Float, { description: 'Скорость' })
  @Prop()
  speed?: number

  @Field(() => Float, { description: 'Ускорение' })
  @Prop()
  boost?: number

  @Field(() => Float, { description: 'Вертикальная скорость' })
  @Prop()
  altSpeed?: number
}

@ObjectType()
@Schema({ _id: false })
export class TrackPhoto {
  @Field(() => String, { description: 'Сыылка на фото' })
  @Prop()
  uri?: string

  @Field(() => String, { description: 'Данные какие-то' })
  @Prop()
  data?: string

  @Field(() => String, { description: 'Описание' })
  @Prop()
  description?: string

  @Field(() => String, { description: 'id локальный для фронта' })
  @Prop()
  id?: string // Тут id можно не валидировать тк он локальный для фронта
}

@ObjectType()
@Schema({ _id: false })
export class TrackNote {
  @Field(() => TrackPoint, { description: 'Точка трека' })
  @Prop()
  point: TrackPoint

  @Field(() => String, { description: 'id локальный для фронта' })
  @Prop()
  id: string // Тут id можно не валидировать тк он локальный для фронта

  @Field(() => String, { description: 'Описание' })
  @Prop()
  description?: string

  @Field(() => [TrackPhoto], { description: 'Набор фотографий' })
  @Prop()
  photos?: TrackPhoto[]

  @Field(() => Boolean, { description: 'Нерабочее?' })
  @Prop()
  disabled?: boolean
}

@ObjectType()
@Schema()
export class Track {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  _id: MongooSchema.Types.ObjectId

  type: 'track'

  @Field(() => String, { description: 'Имя трека' })
  @Prop()
  name: string

  @Field(() => Float, { description: 'Временная метка' })
  @Prop()
  timestamp: number

  @Field(() => [TrackPoint], { description: 'Массив точек трека' })
  @Prop()
  points: TrackPoint[]

  @Field(() => Float, { description: 'Длительность' })
  @Prop()
  duration?: number

  @Field(() => Float, { description: 'Расстояние' })
  @Prop()
  distance?: number

  @Field(() => [TrackNote], { description: 'Заметки о точках трека' })
  @Prop()
  notes?: TrackNote[]

  @Field(() => Boolean, { description: 'Загружено?' })
  @Prop()
  uploaded?: boolean

  @Field(() => String, { description: 'Адрес' })
  @Prop()
  address?: string

  @Field(() => Boolean, { description: 'Нерабочее?' })
  @Prop()
  disabled?: boolean
}

export type TrackDocument = Track & Document
export const TrackSchema = SchemaFactory.createForClass(Track)
