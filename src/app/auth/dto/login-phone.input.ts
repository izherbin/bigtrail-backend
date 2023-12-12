import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class LoginPhoneInput {
  @Field(() => String)
  phone: string
}
