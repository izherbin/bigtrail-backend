import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class LoginUserResponce {
  @Field(() => String)
  authToken: string
}
