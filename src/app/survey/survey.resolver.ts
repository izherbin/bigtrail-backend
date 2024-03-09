import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { SurveyService } from './survey.service'
import { Survey } from './entities/survey.entity'
import { CreateSurveyInput } from './dto/create-survey.input'
// import { UpdateSurveyInput } from './dto/update-survey.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { Phone } from '../auth/phone.decorator'
import { SurveyResult } from './entities/survey-result.entity'
import { SurveyResultInput } from './dto/survey-result.input'

@Resolver(() => Survey)
export class SurveyResolver {
  constructor(private readonly surveyService: SurveyService) {}

  @Mutation(() => Survey, { description: '' })
  @UseGuards(JwtAuthGuard)
  setSurvey(
    @Phone() phone: string,
    @Args('createSurveyInput') createSurveyInput: CreateSurveyInput
  ) {
    return this.surveyService.create(phone, createSurveyInput)
  }

  @Query(() => [Survey], { description: '' })
  getSurveys() {
    return this.surveyService.findAll()
  }

  // @Query(() => Survey)
  // getSurvey(@Args('id') id: string) {
  //   return this.surveyService.findOne(id)
  // }

  // @Mutation(() => Survey)
  // updateSurvey(
  //   @Args('updateSurveyInput') updateSurveyInput: UpdateSurveyInput
  // ) {
  //   return this.surveyService.update(updateSurveyInput.id, updateSurveyInput)
  // }

  @Mutation(() => Survey, { description: '' })
  removeSurvey(@Args('id') id: string) {
    return this.surveyService.remove(id)
  }

  @Mutation(() => SurveyResult, { description: '' })
  storeSurveyResult(
    @Args('surveyResultInput') surveyResultInput: SurveyResultInput
  ) {
    return this.surveyService.storeSurveyResult(surveyResultInput)
  }
}
