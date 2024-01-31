import { Field, InputType } from '@nestjs/graphql'
import { RouteDifficulty } from '../entities/route.entity'

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
}
