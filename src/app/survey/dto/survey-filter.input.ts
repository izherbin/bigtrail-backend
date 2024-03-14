import { Field, InputType } from '@nestjs/graphql'

@InputType({ description: 'Набор фильтров опросов' })
export class SurveyFilterInput {
  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по id опроса'
  })
  id?: string
}
