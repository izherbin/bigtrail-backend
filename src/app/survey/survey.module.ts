import { Module } from '@nestjs/common'
import { SurveyService } from './survey.service'
import { SurveyResolver } from './survey.resolver'
import { UserModule } from '../user/user.module'
import { Survey, SurveySchema } from './entities/survey.entity'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  providers: [SurveyResolver, SurveyService],
  imports: [
    MongooseModule.forFeature([{ name: Survey.name, schema: SurveySchema }]),
    UserModule
  ]
})
export class SurveyModule {}
