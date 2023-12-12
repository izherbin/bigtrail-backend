import { Field, ObjectType } from '@nestjs/graphql'
import { User } from '../entities/user.entity'

@ObjectType()
export class LoginUserResponce {
  @Field(() => User)
  user: User

  @Field(() => String)
  authToken: string
}
