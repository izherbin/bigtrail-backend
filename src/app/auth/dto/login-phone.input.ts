import { InputType, Field } from '@nestjs/graphql'

@InputType({
  description: 'Объект запроса с номером телефона для аутентификации по смс'
})
export class LoginPhoneInput {
  @Field(() => String, {
    description: 'Номер телефона в формате string 7ХХХХХХХХХХ'
  })
  phone: string
}
