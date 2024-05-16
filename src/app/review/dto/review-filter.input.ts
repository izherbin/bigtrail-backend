import { Field, InputType, Int } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType({ description: 'набор фильтров ревью' })
export class ReviewFilterInput {
  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по владельцу'
  })
  userId?: MongooSchema.Types.ObjectId

  @Field(() => Int, {
    nullable: true,
    description: 'С какой позиции выдавать результаты'
  })
  from?: number

  @Field(() => Int, {
    nullable: true,
    description: 'По какую позицию выдавать результаты'
  })
  to?: number
}
