import { InputType, Field } from '@nestjs/graphql'

@InputType({
  description: 'Объект запроса статуса пользователя'
})
export class SetStatusInput {
  @Field(() => String, {
    description: 'Статус пользователя'
  })
  status: string
}
