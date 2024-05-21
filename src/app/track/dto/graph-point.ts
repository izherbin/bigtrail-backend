import { Field, Float, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class GraphPoint {
  @Field(() => Float)
  x: number

  @Field(() => Float)
  y: number
}
