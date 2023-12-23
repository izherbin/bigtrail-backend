import { InputType, Field, Int } from '@nestjs/graphql'

@InputType({
  description: 'Объект запроса с кодом для аутентификации по смс'
})
export class LoginCodeInput {
  @Field(() => Int, {
    description: 'Код аутентификации по смс в формате number NNNNNN'
  })
  code: number
}
