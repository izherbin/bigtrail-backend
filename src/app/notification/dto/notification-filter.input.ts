import { Field, InputType, Int } from '@nestjs/graphql'
import { Types } from 'mongoose'

@InputType({ description: 'Фильтр для получения уведомлений' })
export class NotificationFilterInput {
  @Field(() => [String], {
    nullable: true,
    description: 'Фильтр по массиву id уведомлений'
  })
  ids?: Types.ObjectId[]

  @Field(() => Boolean, {
    nullable: true,
    description: 'Фильтр по прочтенности'
  })
  viewed?: boolean

  @Field(() => Int, {
    nullable: true,
    description: 'С какой позиции выдавать уведомления'
  })
  from?: number

  @Field(() => Int, {
    nullable: true,
    description: 'По какую позицию выдавать уведомления'
  })
  to?: number
}
