import { Injectable } from '@nestjs/common'
import { CreateSurveyInput } from './dto/create-survey.input'
import { UpdateSurveyInput } from './dto/update-survey.input'
import { Model, Schema as MongooSchema } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Survey, SurveyDocument } from './entities/survey.entity'
import { ClientException } from '../client.exception'
import {
  SurveyResult,
  SurveyResultDocument
} from './entities/survey-result.entity'
import { SurveyResultInput } from './dto/survey-result.input'
import { Scenario, ScenarioDocument } from './entities/scenario.entity'
import { CreateScenarioInput } from './dto/create-scenario.input '

@Injectable()
export class SurveyService {
  constructor(
    @InjectModel(Survey.name)
    private surveyModel: Model<SurveyDocument>,
    @InjectModel(SurveyResult.name)
    private surveyResultModel: Model<SurveyResultDocument>,
    @InjectModel(Scenario.name)
    private scenarioModel: Model<ScenarioDocument>
  ) {}

  async createSurvey(phone: string, createSurveyInput: CreateSurveyInput) {
    if (phone !== '79112128506') {
      throw new ClientException(40307)
    }

    const survey = new this.surveyModel(createSurveyInput)
    await survey.save()
    return survey
  }

  async createScenario(
    phone: string,
    createScenarioInput: CreateScenarioInput
  ) {
    if (phone !== '79112128506') {
      throw new ClientException(40307)
    }

    const scenario = new this.scenarioModel(createScenarioInput)
    await scenario.save()
    return scenario
  }

  async getSurveys() {
    const surveys = await this.surveyModel.find()
    return surveys
  }

  async getScenarios() {
    const scenarios = await this.scenarioModel.find()
    return scenarios
  }

  async findOne(id: string) {
    const surveys = await this.surveyModel.findById(id)
    return surveys
  }

  updateSurvey(
    id: MongooSchema.Types.ObjectId,
    updateSurveyInput: UpdateSurveyInput
  ) {
    return `This action updates a #${id.toString()} survey with ${updateSurveyInput}`
  }

  removeSurvey(id: string) {
    return `This action removes a #${id.toString()} survey`
  }

  async storeSurveyResult(surveyResultInput: SurveyResultInput) {
    const { surveyId } = surveyResultInput
    const survey = this.surveyResultModel.findById(surveyId)
    if (!survey) {
      throw new ClientException(40407)
    }

    const surveyResult = new this.surveyResultModel(surveyResultInput)
    await surveyResult.save()
    return surveyResult
  }
}
