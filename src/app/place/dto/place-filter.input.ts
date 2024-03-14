import { Field, InputType, Int } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType({ description: 'Набор фильтров интересных мест' })
export class PlaceFilterInput {
  @Field(() => String, {
    nullable: true,
    description:
      'Фильтр по id интересного места, если назначен то остальные фильтры игнорируются'
  })
  id?: string

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
      'Фильтр по похожести интересных мест на основе расстояния между ними (в поле передается эталонное интересное место)'
  })
  similar?: MongooSchema.Types.ObjectId

  @Field(() => Int, {
    nullable: true,
    description: 'Максимальное число выдаваемых маршрутов'
  })
  max?: number
}
