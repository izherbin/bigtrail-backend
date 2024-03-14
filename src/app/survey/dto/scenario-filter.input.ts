import { Field, InputType } from '@nestjs/graphql'

@InputType({ description: 'Набор фильтров сценариев тестирования' })
export class ScenarioFilterInput {
  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по id сценария тестирования'
  })
  id?: string
}
