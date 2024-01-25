import { ObjectType, Field, Float, Int } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooSchema } from 'mongoose'
import { Photo } from 'src/app/track/dto/photo.response'
import { TrackNote, TrackPoint } from 'src/app/track/entities/track.entity'

export type RouteDifficulty = 'easily' | 'moderately' | 'difficult'

@ObjectType()
@Schema()
export class Route {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  _id: MongooSchema.Types.ObjectId

  @Prop({ default: 'route' })
  type: string

  @Field(() => String, { description: 'id создателя' })
  @Prop()
  userId: MongooSchema.Types.ObjectId

  @Field(() => String, { description: 'id маршрута' })
  @Prop()
  id: string

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

  @Field(() => [Photo], { description: 'Фотографии маршрута' })
  @Prop()
  photos: Photo[]

  @Field(() => Float, { description: 'Временная метка' })
  @Prop()
  timestamp: number

  @Field(() => [TrackPoint], { description: 'Массив точек маршрута' })
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
    description: 'Заметки о точках маршрута'
  })
  @Prop()
  notes?: TrackNote[]

  @Field(() => String, { nullable: true, description: 'Адрес' })
  @Prop()
  address?: string
}

export type RouteDocument = Route & Document
export const RouteSchema = SchemaFactory.createForClass(Route)
