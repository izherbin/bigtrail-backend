import { Field, InputType } from '@nestjs/graphql'

@InputType({ description: 'Объект ввода ответа на опрос' })
export class SurveyResultInput {
  @Field(() => String, { description: 'Ссылка на опрос в MongoDB' })
  surveyId: string

  @Field(() => String, { description: 'Строка ответ на опрос' })
  response: string
}
