import { Module } from '@nestjs/common'
import { SurveyService } from './survey.service'
import { ScenarioResolver, SurveyResolver } from './survey.resolver'
import { UserModule } from '../user/user.module'
import { Survey, SurveySchema } from './entities/survey.entity'
import { MongooseModule } from '@nestjs/mongoose'
import {
  SurveyResult,
  SurveyResultSchema
} from './entities/survey-result.entity'
import { Scenario, ScenarioSchema } from './entities/scenario.entity'
import {
  ScenarioResult,
  ScenarioResultSchema
} from './entities/scenario-result.entity'

@Module({
  providers: [SurveyResolver, ScenarioResolver, SurveyService],
  imports: [
    MongooseModule.forFeature([
      { name: Survey.name, schema: SurveySchema },
      { name: SurveyResult.name, schema: SurveyResultSchema },
      { name: Scenario.name, schema: ScenarioSchema },
      { name: ScenarioResult.name, schema: ScenarioResultSchema }
    ]),
    UserModule
  ]
})
export class SurveyModule {}
