import { InputType, Field } from '@nestjs/graphql'

@InputType({
  description: 'Объект запроса именем пользователя'
})
export class SetNameInput {
  @Field(() => String, {
    description: 'Номер телефона в формате string 7ХХХХХХХХХХ'
  })
  phone: string

  @Field(() => String, {
    description: 'Имя пользователя'
  })
  name: string
}
