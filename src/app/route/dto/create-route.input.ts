import { InputType, Int, Field, Float } from '@nestjs/graphql'
import { RouteDifficulty } from '../entities/route.entity'
import {
  TrackNoteInput,
  TrackPointInput
} from 'src/app/track/dto/create-track.input'
import { SetoutPhotoInput } from './setout-photo.input'

@InputType({ description: 'Информация для создания маршрута' })
export class CreateRouteInput {
  @Field(() => String, {
    nullable: true,
    description: 'Тип, по умолчанию route'
  })
  type: string

  @Field(() => String, {
    nullable: true,
    description: 'id локальный для фронта'
  })
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

  @Field(() => [SetoutPhotoInput], { description: 'Фотографии маршрута' })
  photos: SetoutPhotoInput[]

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

  @Field(() => String, { nullable: true, description: 'Адрес' })
  address?: string
}
