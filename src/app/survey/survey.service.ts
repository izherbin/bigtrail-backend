import { Injectable } from '@nestjs/common'
import { CreateSurveyInput } from './dto/create-survey.input'
import { UpdateSurveyInput } from './dto/update-survey.input'
import { Model, Schema as MongooSchema } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Survey, SurveyDocument } from './entities/survey.entity'
import { ClientErrors, ClientException } from '../client.exception'
import {
  SurveyResult,
  SurveyResultDocument
} from './entities/survey-result.entity'
import { SurveyResultInput } from './dto/survey-result.input'
import { Scenario, ScenarioDocument } from './entities/scenario.entity'
import { CreateScenarioInput } from './dto/create-scenario.input '
import {
  ScenarioResult,
  ScenarioResultDocument
} from './entities/scenario-result.entity'
import { ScenarioResultInput } from './dto/scenario-result.input'
import { ScenarioFilterInput } from './dto/scenario-filter.input'
import { SurveyFilterInput } from './dto/survey-filter.input'

@Injectable()
export class SurveyService {
  constructor(
    @InjectModel(Survey.name)
    private surveyModel: Model<SurveyDocument>,
    @InjectModel(SurveyResult.name)
    private surveyResultModel: Model<SurveyResultDocument>,
    @InjectModel(Scenario.name)
    private scenarioModel: Model<ScenarioDocument>,
    @InjectModel(ScenarioResult.name)
    private scenarioResultModel: Model<ScenarioResultDocument>
  ) {}

  async createSurvey(createSurveyInput: CreateSurveyInput) {
    const survey = new this.surveyModel(createSurveyInput)
    await survey.save()
    return survey
  }

  async createScenario(createScenarioInput: CreateScenarioInput) {
    const scenario = new this.scenarioModel(createScenarioInput)
    await scenario.save()
    return scenario
  }

  async getSurveys(filter: SurveyFilterInput) {
    const surveys = await this.surveyModel.find()
    const surveysFiltered = this.filterSurveys(surveys, filter)
    return surveysFiltered
  }

  async getSurveyResults() {
    const surveyResults = await this.surveyResultModel.find()
    return surveyResults
  }
  async getScenarios(filter: ScenarioFilterInput) {
    const scenarios = await this.scenarioModel.find()
    const scenariosFiltered = this.filterScenarios(scenarios, filter)
    return scenariosFiltered
  }

  async getScenarioResults() {
    const scenarioResults = await this.scenarioResultModel.find()
    return scenarioResults
  }

  filterSurveys(surveys: Survey[], filter: SurveyFilterInput) {
    const { id } = filter || {}

    if (id) {
      const surveysFiltered = surveys.filter((s) => {
        const isFound = s._id.toString() === id
        return isFound
      })
      return surveysFiltered
    }

    return surveys
  }

  filterScenarios(scenarios: Scenario[], filter: ScenarioFilterInput) {
    const { id } = filter || {}

    if (id) {
      const scenariosFiltered = scenarios.filter((s) => {
        const isFound = s._id.toString() === id
        return isFound
      })
      return scenariosFiltered
    }

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
    const survey = await this.surveyModel.findById(surveyId)
    if (!survey) {
      throw new ClientException(ClientErrors['No such survey'])
    }

    const surveyResult = new this.surveyResultModel(surveyResultInput)
    await surveyResult.save()
    return surveyResult
  }

  async storeScenarioResult(scenarioResultInput: ScenarioResultInput) {
    const { scenarioId } = scenarioResultInput
    const scenario = await this.scenarioModel.findById(scenarioId)
    if (!scenario) {
      throw new ClientException(ClientErrors['No such scenario'])
    }

    const scenarioResult = new this.scenarioResultModel(scenarioResultInput)
    await scenarioResult.save()
    return scenarioResult
  }
}
