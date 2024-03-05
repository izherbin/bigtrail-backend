import { InputType, Field } from '@nestjs/graphql'

@InputType({
  description:
    'Объект запроса для отслеживания изменений интересного места заданного пользователя'
})
export class SubscriptionPlaceInput {
  @Field(() => String, {
    nullable: true,
    description:
      'Идентифкатор пользователя в MongoDB, если null, то - текущий пользователь'
  })
  userId?: string
}
