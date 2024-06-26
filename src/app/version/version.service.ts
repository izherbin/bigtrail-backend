import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Version, VersionDocument } from './entities/version.entity'
import { Model } from 'mongoose'
import { SetVersionInput } from './dto/set-version.input'
import { AppLinks, AppLinksDocument } from './entities/app-links.entity'
import { SetAppLinksInput } from './dto/set-app-links.input'
import { ClientErrors, ClientException } from '../client.exception'

@Injectable()
export class VersionService {
  constructor(
    @InjectModel(Version.name)
    private versionModel: Model<VersionDocument>,
    @InjectModel(AppLinks.name)
    private appLinksModel: Model<AppLinksDocument>
  ) {}

  async getVersion() {
    const version = await this.versionModel.findOne({})
    if (!version) {
      throw new ClientException(ClientErrors['No versions in DB'])
    }

    version.backend = process.env.npm_package_version
    return version
  }

  async setVersion(setVersionInput: SetVersionInput) {
    let version = await this.versionModel.findOne({})
    if (!version) {
      version = new this.versionModel(setVersionInput)
      version.save()
    } else {
      version = await this.versionModel.findOneAndUpdate({}, setVersionInput)
    }

    return { ...setVersionInput, backend: process.env.npm_package_version }
  }

  async getAppLinks() {
    const links = this.appLinksModel.findOne({})
    return links
  }

  async setAppLinks(setAppLinksInput: SetAppLinksInput) {
    let links = await this.appLinksModel.findOne({})
    if (!links) {
      links = new this.appLinksModel(setAppLinksInput)
      links.save()
    } else {
      links = await this.appLinksModel.findOneAndUpdate({}, setAppLinksInput)
    }

    return setAppLinksInput
  }
}
