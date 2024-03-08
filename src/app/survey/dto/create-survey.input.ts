import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class SurveyItemInput {
  @Field(() => String, { description: '' })
  name: string

  @Field(() => Boolean, { nullable: true, description: '' })
  hasCustomString?: boolean
}

@InputType()
export class CreateSurveyInput {
  @Field(() => String, { description: '' })
  name: string

  @Field(() => [SurveyItemInput], { description: '' })
  items: SurveyItemInput[]
}
