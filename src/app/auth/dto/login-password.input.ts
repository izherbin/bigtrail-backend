import { InputType, Field } from '@nestjs/graphql'

@InputType({
  description: 'Объект запроса с кодом для аутентификации по паролю'
})
export class LoginPasswordInput {
  @Field(() => String, {
    description: 'Имя администратора'
  })
  login: string

  @Field(() => String, {
    description: 'Пароль администратора'
  })
  password: string
}
