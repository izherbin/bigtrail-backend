import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Version, VersionDocument } from './entities/version.entity'
import { Model } from 'mongoose'
import { SetVersionInput } from './dto/set-version.input'

@Injectable()
export class VersionService {
  constructor(
    @InjectModel(Version.name)
    private versionModel: Model<VersionDocument>
  ) {}

  async getVersion() {
    const version = await this.versionModel.findOne({})
    if (!version) {
      throw new HttpException('No versions in DB', HttpStatus.NOT_FOUND)
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
}
