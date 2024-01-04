import { InputType, Field, Float } from '@nestjs/graphql'

@InputType()
export class TrackPointInput {
  @Field(() => Float, { description: 'Широта' })
  lat: number

  @Field(() => Float, { description: 'Долгота' })
  lon: number

  @Field(() => Float, { description: 'Высота' })
  alt?: number

  @Field(() => Float, { description: 'Временная метка' })
  timestamp?: number

  @Field(() => Float, { description: 'Скорость' })
  speed?: number

  @Field(() => Float, { description: 'Ускорение' })
  boost?: number

  @Field(() => Float, { description: 'Вертикальная скорость' })
  altSpeed?: number
}

@InputType()
export class TrackPhotoInput {
  @Field(() => String, { description: 'Сыылка на фото' })
  uri?: string

  @Field(() => String, { description: 'Данные какие-то' })
  data?: string

  @Field(() => String, { description: 'Описание' })
  description?: string

  @Field(() => String, { description: 'id локальный для фронта' })
  id?: string // Тут id можно не валидировать тк он локальный для фронта
}

@InputType()
export class TrackNoteInput {
  @Field(() => TrackPointInput, { description: 'Точка трека' })
  point: TrackPointInput

  @Field(() => String, { description: 'id локальный для фронта' })
  id: string // Тут id можно не валидировать тк он локальный для фронта

  @Field(() => String, { description: 'Описание' })
  description?: string

  @Field(() => [TrackPhotoInput], { description: 'Набор фотографий' })
  photos?: TrackPhotoInput[]

  @Field(() => Boolean, { description: 'Нерабочее?' })
  disabled?: boolean
}

@InputType()
export class CreateTrackInput {
  @Field(() => String, { description: 'Имя трека' })
  name: string

  @Field(() => Float, { description: 'Временная метка' })
  timestamp: number

  @Field(() => [TrackPointInput], { description: 'Массив точек трека' })
  points: TrackPointInput[]

  @Field(() => Float, { description: 'Длительность' })
  duration?: number

  @Field(() => Float, { description: 'Расстояние' })
  distance?: number

  @Field(() => [TrackNoteInput], { description: 'Заметки о точках трека' })
  notes?: TrackNoteInput[]

  @Field(() => Boolean, { description: 'Загружено?' })
  uploaded?: boolean

  @Field(() => String, { description: 'Адрес' })
  address?: string

  @Field(() => Boolean, { description: 'Нерабочее?' })
  disabled?: boolean
}
