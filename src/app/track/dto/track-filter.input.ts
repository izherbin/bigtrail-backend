import { Field, Float, InputType } from '@nestjs/graphql'

@InputType({ description: 'Набор фильтров треков' })
export class TrackFilterInput {
  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по id трека'
  })
  id?: string

  @Field(() => Float, {
    nullable: true,
    description:
      'Значение толерантности от 0 до 1 от области трека для вычисления симплифицированных точек трека'
  })
  simplify?: number
}
