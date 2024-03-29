import { InputType, Field, Float } from '@nestjs/graphql'

@InputType({ description: 'Входящая информация о точке на треке' })
export class TrackPointInput {
  @Field(() => Float, { description: 'Широта' })
  lat: number

  @Field(() => Float, { description: 'Долгота' })
  lon: number

  @Field(() => Float, { nullable: true, description: 'Высота' })
  alt?: number

  @Field(() => Float, { nullable: true, description: 'Временная метка' })
  timestamp?: number

  @Field(() => Float, { nullable: true, description: 'Скорость' })
  speed?: number

  @Field(() => Float, { nullable: true, description: 'Ускорение' })
  boost?: number

  @Field(() => Float, { nullable: true, description: 'Вертикальная скорость' })
  altSpeed?: number
}

@InputType({ description: 'Входящая информация о фото в треке' })
export class TrackPhotoInput {
  @Field(() => String, { nullable: true, description: 'Сыылка на фото' })
  uri?: string

  @Field(() => String, { nullable: true, description: 'Описание' })
  description?: string

  @Field(() => String, {
    nullable: true,
    description: 'id локальный для фронта'
  })
  id?: string
}

@InputType({ description: 'Входящая информация о заметке в треке' })
export class TrackNoteInput {
  @Field(() => TrackPointInput, { description: 'Точка трека' })
  point: TrackPointInput

  @Field(() => String, { description: 'id локальный для фронта' })
  id: string

  @Field(() => String, { nullable: true, description: 'Описание' })
  description?: string

  @Field(() => [TrackPhotoInput], {
    nullable: true,
    description: 'Набор фотографий'
  })
  photos?: TrackPhotoInput[]

  @Field(() => Boolean, { nullable: true, description: 'Нерабочее?' })
  disabled?: boolean
}

@InputType({ description: 'Входящая информация о треке' })
export class CreateTrackInput {
  @Field(() => String, {
    nullable: true,
    description: 'Тип, по умолчанию track'
  })
  type: string

  @Field(() => String, {
    nullable: true,
    description: 'id локальный для фронта'
  })
  id: string

  @Field(() => String, { description: 'Имя трека' })
  name: string

  @Field(() => Float, { description: 'Временная метка' })
  timestamp: number

  @Field(() => [TrackPointInput], { description: 'Массив точек трека' })
  points: TrackPointInput[]

  @Field(() => Float, { nullable: true, description: 'Длительность' })
  duration?: number

  @Field(() => Float, { nullable: true, description: 'Расстояние' })
  distance?: number

  @Field(() => [TrackNoteInput], {
    nullable: true,
    description: 'Заметки о точках трека'
  })
  notes?: TrackNoteInput[]

  @Field(() => String, { nullable: true, description: 'Адрес' })
  address?: string

  @Field(() => Boolean, { nullable: true, description: 'Нерабочее?' })
  disabled?: boolean
}
