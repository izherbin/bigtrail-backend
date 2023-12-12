import { ObjectType, Field, Int, Float } from '@nestjs/graphql'

type timestamp = number
type JwtToken = string

@ObjectType()
export class User {
  @Field(() => String)
  phone: string

  @Field(() => Int)
  code: number

  @Field(() => Float)
  tsSMSSent: timestamp

  @Field(() => String, { nullable: true })
  token: JwtToken
}
