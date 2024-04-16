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
import { Scenario } from './entities/scenario.entity'
import { CreateScenarioInput } from './dto/create-scenario.input '
import { ScenarioResult } from './entities/scenario-result.entity'
import { ScenarioResultInput } from './dto/scenario-result.input'
import { ScenarioFilterInput } from './dto/scenario-filter.input'
import { SurveyFilterInput } from './dto/survey-filter.input'
import { RolesGuard } from '../auth/roles.guards'
import { Role } from '../user/entities/user.entity'
import { RequiredRoles } from '../auth/required-roles.decorator'

@Resolver(() => Survey)
export class SurveyResolver {
  constructor(private readonly surveyService: SurveyService) {}

  @Mutation(() => Survey, { description: 'Создать опрос' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  adminSetSurvey(
    @Phone() phone: string,
    @Args('createSurveyInput') createSurveyInput: CreateSurveyInput
  ) {
    return this.surveyService.createSurvey(phone, createSurveyInput)
  }

  @Query(() => [Survey], {
    description: 'Выдать список опросов, удовлетворяющих фильтру'
  })
  @UseGuards(JwtAuthGuard)
  getSurveys(
    @Args('surveyFilterInput', { nullable: true })
    surveyFilterInput: SurveyFilterInput
  ) {
    return this.surveyService.getSurveys(surveyFilterInput)
  }

  @Query(() => [SurveyResult], {
    description: 'Выдать список результатов опроса (для админа)'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  adminGetSurveyResults() {
    return this.surveyService.getSurveyResults()
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

  // @Mutation(() => Survey, { description: '' })
  // removeSurvey(@Args('id') id: string) {
  //   return this.surveyService.removeSurvey(id)
  // }

  @Mutation(() => SurveyResult, { description: 'Сохранить результат опроса' })
  storeSurveyResult(
    @Args('surveyResultInput') surveyResultInput: SurveyResultInput
  ) {
    return this.surveyService.storeSurveyResult(surveyResultInput)
  }
}

@Resolver(() => Scenario)
export class ScenarioResolver {
  constructor(private readonly surveyService: SurveyService) {}

  @Mutation(() => Scenario, {
    description: 'Создать сценарий тестироваиия (для админа)'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  adminSetScenario(
    @Phone() phone: string,
    @Args('createScenarioInput') createScenarioInput: CreateScenarioInput
  ) {
    return this.surveyService.createScenario(phone, createScenarioInput)
  }

  @Query(() => [Scenario], {
    description: 'Выдать список сценариев тестирования, удовлетворяющих фильтру'
  })
  @UseGuards(JwtAuthGuard)
  getScenarios(
    @Args('scenarioFilterInput', { nullable: true })
    scenarioFilterInput: ScenarioFilterInput
  ) {
    return this.surveyService.getScenarios(scenarioFilterInput)
  }

  @Query(() => [ScenarioResult], {
    description: 'Выдать список результатов сценария тестирования (для админа)'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  adminGetScenarioResults() {
    return this.surveyService.getScenarioResults()
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

  // @Mutation(() => Survey, { description: '' })
  // removeScenario(@Args('id') id: string) {
  //   return this.surveyService.removeSurvey(id)
  // }

  @Mutation(() => ScenarioResult, {
    description: 'Сохранение результатов тестирования'
  })
  storeScenarioResult(
    @Args('scenarioResultInput') scenarioResultInput: ScenarioResultInput
  ) {
    return this.surveyService.storeScenarioResult(scenarioResultInput)
  }
}
