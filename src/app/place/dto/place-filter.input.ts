import { Field, InputType, Int } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType({ description: 'Набор фильтров интересных мест' })
export class PlaceFilterInput {
  @Field(() => [String], {
    nullable: true,
    description:
      'Фильтр по массиву id интересных мест, если назначен то остальные фильтры игнорируются'
  })
  ids?: string[]

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по типу'
  })
  type?: string

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по владельцу'
  })
  userId?: MongooSchema.Types.ObjectId

  @Field(() => String, {
    nullable: true,
    description:
      'Вид сортировки интересных мест: similarity или date, по умолчанию date, если similar не указан'
  })
  sort?: 'date' | 'similarity'

  @Field(() => String, {
    nullable: true,
    description:
      'Вид сортировки интересных мест: asc или desc, по умолчанию asc'
  })
  order?: 'asc' | 'desc'

  @Field(() => String, {
    nullable: true,
    description:
      'Фильтр по похожести интересных мест на основе расстояния между ними (в поле передается эталонное интересное место)'
  })
  similar?: MongooSchema.Types.ObjectId

  @Field(() => Boolean, {
    nullable: true,
    description: 'Фильтр по отмодерированности'
  })
  moderated?: boolean

  @Field(() => Boolean, {
    nullable: true,
    description: 'Фильтр по верифицированности'
  })
  verified?: boolean

  @Field(() => Int, {
    nullable: true,
    description:
      'С какой позиции выдавать интересные места (отсчет ведется с 0)'
  })
  from?: number

  @Field(() => Int, {
    nullable: true,
    description:
      'По какую позицию выдавать интересные места (последняя позиция не включается)'
  })
  to?: number
}
