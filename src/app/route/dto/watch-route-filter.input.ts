import { Field, InputType } from '@nestjs/graphql'
import { Types } from 'mongoose'

@InputType({ description: 'Набор фильтров маршрутов' })
export class WatchRoutesFilterInput {
  @Field(() => [String], {
    nullable: true,
    description: 'Фильтр по массиву id маршрутов'
  })
  ids?: Types.ObjectId[]

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по владельцу'
  })
  userId?: Types.ObjectId
}
