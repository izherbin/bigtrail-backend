import { ObjectType, Field, Int, Float } from '@nestjs/graphql'

type timestamp = number
type JwtToken = string

@ObjectType()
export class User {
  @Field(() => String, {
    description: 'Номер телефона в формате string 7ХХХХХХХХХХ'
  })
  phone: string

  @Field(() => Int, {
    description: 'Код аутентификации по смс в формате number NNNNNN'
  })
  code: number

  @Field(() => Float, {
    description: 'Время отправки смс пользователю в формате timestamp'
  })
  tsSMSSent: timestamp

  @Field(() => String, {
    nullable: true,
    description: 'JWT-токен для аутентификации запросов с фронтенда'
  })
  token: JwtToken
}
