import { Field, InputType, OmitType } from '@nestjs/graphql'
import { ScenarioResult } from '../entities/scenario-result.entity'

@InputType({
  description: 'Объект ввода резултата выполнения сценария тестирования'
})
export class ScenarioResultInput extends OmitType(
  ScenarioResult,
  ['_id', 'scenarioId'],
  InputType
) {
  @Field(() => String, {
    description: 'Ссылка на сценарий тестирования в MongoDB'
  })
  scenarioId: string
}
