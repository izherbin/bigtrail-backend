import { InputType, Int, Field, Float } from '@nestjs/graphql'
import { RouteDifficulty } from '../entities/route.entity'
// import { Photo } from 'src/app/track/dto/photo.response'
import {
  TrackNoteInput,
  TrackPointInput
} from 'src/app/track/dto/create-track.input'

@InputType()
export class CreateRouteInput {
  @Field(() => String, { description: 'id маршрута' })
  id: string

  @Field(() => String, { description: 'Имя маршрута' })
  name: string

  @Field(() => String, { description: '' })
  transit: string

  @Field(() => String, { description: 'Категория маршрута' })
  category: string

  @Field(() => [Int], { description: 'Доступность маршрута' })
  availability: number[]

  @Field(() => String, { description: 'Сложность маршрута' })
  difficulty: RouteDifficulty

  @Field(() => String, { description: 'Описание маршрута' })
  description: string

  // @Field(() => [Photo], { description: 'Фотографии маршрута' })
  // photos: Photo[]

  @Field(() => Float, { description: 'Временная метка' })
  timestamp: number

  @Field(() => [TrackPointInput], { description: 'Массив точек маршрута' })
  points: TrackPointInput[]

  @Field(() => Float, { nullable: true, description: 'Длительность' })
  duration?: number

  @Field(() => Float, { nullable: true, description: 'Расстояние' })
  distance?: number

  @Field(() => [TrackNoteInput], {
    nullable: true,
    description: 'Заметки о точках маршрута'
  })
  notes?: TrackNoteInput[]

  @Field(() => Boolean, { nullable: true, description: 'Загружено?' })
  uploaded?: boolean

  @Field(() => String, { nullable: true, description: 'Адрес' })
  address?: string
}
