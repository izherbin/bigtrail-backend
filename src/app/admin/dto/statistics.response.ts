import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'Общая статистика (администратор)' })
export class StatisticsResponse {
  @Field(() => Int, { description: 'Количество пользователей' })
  users: number

  @Field(() => Int, { description: 'Количество маршрутов' })
  routes: number

  @Field(() => Int, { description: 'Количество треков' })
  tracks: number

  @Field(() => Int, { description: 'Количество интересных мест' })
  places: number
}
