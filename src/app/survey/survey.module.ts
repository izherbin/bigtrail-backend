import { Module } from '@nestjs/common'
import { SurveyService } from './survey.service'
import { SurveyResolver } from './survey.resolver'
import { UserModule } from '../user/user.module'
import { Survey, SurveySchema } from './entities/survey.entity'
import { MongooseModule } from '@nestjs/mongoose'
import {
  SurveyResult,
  SurveyResultSchema
} from './entities/survey-result.entity'

@Module({
  providers: [SurveyResolver, SurveyService],
  imports: [
    MongooseModule.forFeature([
      { name: Survey.name, schema: SurveySchema },
      { name: SurveyResult.name, schema: SurveyResultSchema }
    ]),
    UserModule
  ]
})
export class SurveyModule {}
