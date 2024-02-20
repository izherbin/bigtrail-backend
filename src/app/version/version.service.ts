import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Version, VersionDocument } from './entities/version.entity'
import { Model } from 'mongoose'
import { SetVersionInput } from './dto/set-version.input'
import { AppLinks, AppLinksDocument } from './entities/app-links.entity'
import { SetAppLinksInput } from './dto/set-app-links.input'
import { ClientException } from '../client.exception'

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
      throw new ClientException(40405)
    }

    version.backend = process.env.npm_package_version
    return version
  }

  async setVersion(phone: string, setVersionInput: SetVersionInput) {
    if (phone !== '79112128506') {
      throw new ClientException(40305)
    }

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

  async setAppLinks(phone: string, setAppLinksInput: SetAppLinksInput) {
    if (phone !== '79112128506') {
      throw new ClientException(40306)
    }

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
