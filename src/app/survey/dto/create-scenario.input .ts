import { InputType, Field } from '@nestjs/graphql'

@InputType({ description: 'Объект ввода этапа сценария тестирования' })
export class ScenarioItemInput {
  @Field(() => String, { description: 'Название этапа сценария тестирования' })
  name: string
}

@InputType()
export class CreateScenarioInput {
  @Field(() => String, { description: 'Сценарий тестирования' })
  name: string

  @Field(() => [ScenarioItemInput], {
    description: 'Этапы сценария тестирования'
  })
  items: ScenarioItemInput[]
}
