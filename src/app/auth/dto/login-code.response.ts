import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({
  description: 'Объект ответа после отправки смс'
})
export class LoginCodeResponce {
  @Field(() => String, {
    description: 'Номер телефона в формате string 7ХХХХХХХХХХ'
  })
  phone: string

  @Field(() => String, {
    description: 'Время отправки смс пользователю в формате timestamp'
  })
  sent: string

  @Field(() => String, {
    description:
      'Время допустимой повторной отправки смс пользователю в формате timestamp'
  })
  canSendAgain: string
}
