import { ObjectType, Field, Float, Int } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { TrackPhoto } from 'src/app/track/entities/track.entity'
import { Document, Schema as MongooSchema } from 'mongoose'
import { Review } from 'src/app/review/entities/review.entity'

export type PlaceCategory =
  | 'religious'
  | 'informationCenter'
  | 'observationTower'
  | 'waterfall'
  | 'spring'

@ObjectType({ description: 'Интересное место' })
@Schema()
export class Place {
  @Field(() => String, {
    description: 'Идентификатор интересного места в MongoDB'
  })
  _id: MongooSchema.Types.ObjectId

  @Field(() => String, { description: 'Тип контента' })
  @Prop({ default: 'place' })
  type: 'place'

  //TODO Delete this if timestamp is not needed
  @Field(() => Float, { description: 'Временная метка создания' })
  @Prop()
  timestamp: number

  @Field(() => Float, {
    nullable: true,
    description: 'Время создания интересного места в формате timestamp'
  })
  @Prop()
  tsCreated?: number

  @Field(() => String, { description: 'Индетификатор создателя в MongoDB' })
  @Prop()
  userId: MongooSchema.Types.ObjectId

  @Field(() => String, { description: 'Название' })
  @Prop()
  name: string

  @Field(() => String, { description: 'Адрес' })
  @Prop()
  address: string

  @Field(() => Float, { description: 'Широта' })
  @Prop()
  lat: number

  @Field(() => Float, { description: 'Долгота' })
  @Prop()
  lon: number

  @Field(() => String, { description: 'Описание' })
  @Prop()
  description: string

  @Field(() => String, { description: 'Категоря интересного места' })
  @Prop()
  category: PlaceCategory

  @Field(() => [TrackPhoto], {
    nullable: true,
    description: 'Фото интересного места'
  })
  @Prop()
  photos?: TrackPhoto[]

  @Field(() => Boolean, {
    nullable: true,
    description: 'Модерировано ли интересное место?'
  })
  @Prop()
  moderated?: boolean

  @Field(() => Boolean, {
    nullable: true,
    description: 'Верифицировано ли интересное место?'
  })
  @Prop()
  verified?: boolean

  @Prop()
  reviews?: Review[]

  @Field(() => Int, {
    nullable: true,
    description: 'Количество отзывов'
  })
  @Prop()
  reviewsCount: number

  @Field(() => Float, {
    nullable: true,
    description: 'Средний рейтинг'
  })
  @Prop()
  rating?: number

  @Field(() => Boolean, {
    nullable: true,
    description: 'Находится ли в списке избранного?'
  })
  favorite: boolean
}

export type PlaceDocument = Place & Document
export const PlaceSchema = SchemaFactory.createForClass(Place)
