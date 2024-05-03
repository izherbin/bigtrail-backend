import { Field, Float, InputType, Int } from '@nestjs/graphql'
import { RouteDifficulty } from '../entities/route.entity'
import { Schema as MongooSchema } from 'mongoose'

@InputType({ description: 'Набор фильтров маршрутов' })
export class RouteFilterInput {
  @Field(() => [String], {
    nullable: true,
    description:
      'Фильтр по массиву id маршрутов, если назначен то остальные фильтры игнорируются, кроме simplify'
  })
  ids?: string[]

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по владельцу'
  })
  userId?: MongooSchema.Types.ObjectId

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по поисковой строке'
  })
  search?: string

  @Field(() => [String], {
    nullable: true,
    description: 'Фильтр по транзиту'
  })
  transit?: string[]

  @Field(() => [String], {
    nullable: true,
    description: 'Фильтр по категории'
  })
  category?: string[]

  @Field(() => [String], {
    nullable: true,
    description: 'Фильтр по сложности'
  })
  difficulty?: [RouteDifficulty]

  @Field(() => String, {
    nullable: true,
    description:
      'Вид сортировки маршрутов: similarity или date, по умолчанию date, если similar не указан'
  })
  sort?: 'date' | 'similarity'

  @Field(() => String, {
    nullable: true,
    description:
      'Фильтр по сортировке маршрутов: asc или desc, по умолчанию asc'
  })
  order?: 'asc' | 'desc'

  @Field(() => String, {
    nullable: true,
    description:
      'Фильтр по похожести маршрутов на основе расстояния между первыми точками трека (в поле передается эталонный маршрут)'
  })
  similar?: MongooSchema.Types.ObjectId

  @Field(() => Float, {
    nullable: true,
    description:
      'Значение толерантности от 0 до 1 от области маршрута для вычисления симплифицированных точек трека маршрута'
  })
  simplify?: number

  @Field(() => Int, {
    nullable: true,
    description: 'С какой позиции выдавать маршруты (отсчет ведется с 0)'
  })
  from?: number

  @Field(() => Int, {
    nullable: true,
    description:
      'По какую позицию выдавать маршруты (последняя позиция не включается)'
  })
  to?: number

  @Field(() => Boolean, {
    nullable: true,
    description: 'Фильтр по отмодерированности маршрута'
  })
  moderated?: boolean

  @Field(() => Boolean, {
    nullable: true,
    description: 'Фильтр по верифицированности маршрута'
  })
  verified?: boolean
}
