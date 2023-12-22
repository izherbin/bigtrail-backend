import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class LoginCodeResponce {
  @Field(() => String)
  phone: string

  @Field(() => String)
  sent: string

  @Field(() => String)
  canSendAgain: string
}
