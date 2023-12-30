import { InputType, Field, Int } from '@nestjs/graphql'

@InputType({
  description: 'Объект запроса с кодом для аутентификации по смс'
})
export class LoginCodeInput {
  @Field(() => String, {
    description: 'Номер телефона в формате string 7ХХХХХХХХХХ'
  })
  phone: string

  @Field(() => Int, {
    description: 'Код аутентификации по смс в формате number NNNNNN'
  })
  code: number
}
