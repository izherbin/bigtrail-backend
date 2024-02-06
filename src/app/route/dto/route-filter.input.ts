import { Field, InputType, Int } from '@nestjs/graphql'
import { RouteDifficulty } from '../entities/route.entity'
import { Schema as MongooSchema } from 'mongoose'

@InputType({ description: 'Набор фильтров маршрутов' })
export class RouteFilterInput {
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
      'Фильтр по похожести маршрутов на основе расстояния между первыми точками трека (в поле передается эталонный маршрут)'
  })
  similar?: MongooSchema.Types.ObjectId

  @Field(() => Int, {
    nullable: true,
    description: 'Фильтр по сложности'
  })
  max?: number
}
