import { Field, Float, Int, ObjectType, PickType } from '@nestjs/graphql'
import { User } from 'src/app/user/entities/user.entity'

@ObjectType({
  description: 'Статистика пользователя'
})
export class UserStatistics {
  @Field(() => Int, {
    description: 'Количество подписчиков у данного пользователя'
  })
  subscribers: number

  @Field(() => Int, {
    description: 'Количество подписок у данного пользователя'
  })
  subscriptions: number

  @Field(() => Int, {
    description: 'Количество маршрутов у данного пользователя'
  })
  routes: number

  @Field(() => Float, {
    description: 'Сумма duration tracks у данного пользователя'
  })
  duration: number

  @Field(() => Float, {
    description: 'Сумма distance tracks у данного пользователя'
  })
  distance: number

  @Field(() => Int, {
    description: 'Количество очков пользователя'
  })
  points: number
}

@ObjectType({
  description: 'Объект ответа после запроса своего профайла'
})
export class GetProfileResponse extends PickType(User, [
  '_id',
  'phone',
  'name',
  'status'
]) {
  @Field(() => String, {
    nullable: true,
    description: 'Аватар пользователя (временная download-ссылка на аватар )'
  })
  avatar?: string

  @Field(() => UserStatistics, {
    description: 'Статистика пользователя'
  })
  statistics: UserStatistics
}
