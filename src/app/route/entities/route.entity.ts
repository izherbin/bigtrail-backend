import { ObjectType, Field, Float, Int } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooSchema } from 'mongoose'
import { Review } from 'src/app/review/entities/review.entity'
import { TrackNote, TrackPoint } from 'src/app/track/entities/track.entity'

export type RouteDifficulty = 'easily' | 'moderately' | 'difficult'

@ObjectType({ description: 'Маршрут' })
@Schema()
export class SetoutPhoto {
  @Field(() => String, {
    nullable: true,
    description: 'Ссылка на загрузку в Minio'
  })
  uri: string

  @Prop()
  filename?: string

  @Field(() => String, { description: 'Совпадает с TrackPhoto.id' })
  id: string
}

@ObjectType()
@Schema()
export class Route {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  _id: MongooSchema.Types.ObjectId

  @Field(() => String, {
    nullable: true,
    description: 'Тип, по умолчанию route'
  })
  @Prop({ default: 'route' })
  type?: string

  @Field(() => String, { description: 'id локальный для фронта' })
  id: string

  @Field(() => String, { description: 'id создателя' })
  @Prop()
  userId: MongooSchema.Types.ObjectId

  @Field(() => String, { description: 'Имя маршрута' })
  @Prop()
  name: string

  @Field(() => String, { description: '' })
  @Prop()
  transit: string

  @Field(() => String, { description: 'Категория маршрута' })
  @Prop()
  category: string

  @Field(() => [Int], { description: 'Доступность маршрута' })
  @Prop()
  availability: number[]

  @Field(() => String, { description: 'Сложность маршрута' })
  @Prop()
  difficulty: RouteDifficulty

  @Field(() => String, { description: 'Описание маршрута' })
  @Prop()
  description: string

  @Field(() => [SetoutPhoto], { description: 'Фотографии маршрута' })
  @Prop()
  photos: SetoutPhoto[]

  //TODO Delete this if timestamp is not needed
  @Field(() => Float, { description: 'Временная метка' })
  @Prop()
  timestamp: number

  @Field(() => Float, {
    nullable: true,
    description: 'Время создания маршрута в формате timestamp'
  })
  @Prop()
  tsCreated?: number

  @Field(() => [TrackPoint], { description: 'Массив точек маршрута' })
  @Prop()
  points: TrackPoint[]

  @Field(() => Float, { description: 'Длительность' })
  @Prop()
  duration?: number

  @Field(() => Float, { description: 'Расстояние' })
  @Prop()
  distance: number

  @Field(() => [TrackNote], {
    nullable: true,
    description: 'Заметки о точках маршрута'
  })
  @Prop()
  notes: TrackNote[]

  @Field(() => String, { description: 'Адрес' })
  @Prop()
  address: string

  @Field(() => Boolean, {
    nullable: true,
    description: 'Модерирован ли маршрут?'
  })
  @Prop()
  moderated?: boolean

  @Field(() => Boolean, {
    nullable: true,
    description: 'Верифицирован ли маршрут?'
  })
  @Prop()
  verified?: boolean

  @Prop()
  reviews?: Review[]

  @Field(() => Boolean, {
    nullable: true,
    description: 'Находится ли в списке избранного?'
  })
  favorite?: boolean
}

export type RouteDocument = Route & Document
export const RouteSchema = SchemaFactory.createForClass(Route)
