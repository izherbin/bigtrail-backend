import { InputType, Field } from '@nestjs/graphql'

@InputType({ description: 'Объект ввода варианта ответа на опрос' })
export class SurveyItemInput {
  @Field(() => String, { description: 'Название варианта ответа на опрос' })
  name: string

  @Field(() => Boolean, {
    nullable: true,
    description: 'Есть ли собственный вариант ответа?'
  })
  hasCustomString?: boolean
}

@InputType()
export class CreateSurveyInput {
  @Field(() => String, { description: 'Объект ввода при создании опроса' })
  name: string

  @Field(() => [SurveyItemInput], { description: 'Варианты ответов опроса' })
  items: SurveyItemInput[]
}
