import { InputType, Field, Int } from '@nestjs/graphql'

@InputType()
export class LoginCodeInput {
  @Field(() => Int)
  code: number
}
