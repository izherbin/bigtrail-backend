import { InputType, Field } from '@nestjs/graphql'
import { Types } from 'mongoose'

@InputType({
  description:
    'Объект запроса для отслеживания изменений интересного места заданного пользователя'
})
export class WatchPlacesFilterInput {
  @Field(() => [String], {
    nullable: true,
    description: 'Фильтр по массиву id интересных мест'
  })
  ids?: Types.ObjectId[]

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по владельцу интересного места'
  })
  userId?: Types.ObjectId
}
