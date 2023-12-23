import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({
  description: 'Объект ответа после отправки кода аутентификации'
})
export class LoginUserResponce {
  @Field(() => String, {
    description: 'JWT-токен для аутентификации запросов с фронтенда'
  })
  authToken: string
}
