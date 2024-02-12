import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from './entities/user.entity'
import { Model, Schema as MongooSchema } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import { SetNameInput } from './dto/set-name.input'
import { Readable } from 'stream'
import { MinioClientService } from '../minio-client/minio-client.service'
import { GetProfileResponse } from './dto/get-profile.response'
import { RouteService } from '../route/route.service'
import { PubSubEngine } from 'graphql-subscriptions'
import { SetStatusInput } from './dto/set-status.input'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly minioClientService: MinioClientService,
    private readonly routeService: RouteService,
    @Inject('PUB_SUB') private pubSub: PubSubEngine
  ) {}

  async getProfileQuery(phone: string) {
    const user = await this.userModel.findOne({ phone })

    const profile = user.toObject() as GetProfileResponse
    profile.statistics = await this.routeService.calcUserStatistics(user._id)
    return profile
  }

  async getProfileById(id: MongooSchema.Types.ObjectId) {
    const user = await this.userModel.findById(id)

    const profile = user.toObject() as GetProfileResponse
    profile.statistics = await this.routeService.calcUserStatistics(user._id)
    return profile
  }

  watchProfile() {
    const res = this.pubSub.asyncIterator('profileChanged')
    return res
  }

  async getUserByPhone(phone: string) {
    const user = await this.userModel.findOne({ phone })
    return user
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id)
    if (!user) {
      throw new HttpException('No such profile', HttpStatus.NOT_FOUND)
    }

    const profile = user.toObject() as GetProfileResponse
    profile.statistics = await this.routeService.calcUserStatistics(user._id)
    return profile
  }

  async createUser(phone: string) {
    const user = await this.userModel.findOne({ phone })
    if (user) {
      throw new HttpException(
        'This user is already exists',
        HttpStatus.CONFLICT
      )
    }
    const res = await this.userModel.insertMany([{ phone }])
    return res[0]
  }

  async updateUser(user: User) {
    const userFromDB = await this.userModel.findOne({ phone: user.phone })
    if (!userFromDB) {
      throw new HttpException('No such user', HttpStatus.NOT_FOUND)
    }

    if (userFromDB.isAdmin) {
      throw new HttpException(
        'Can not update this profile',
        HttpStatus.FORBIDDEN
      )
    }

    return await userFromDB.updateOne(user)
  }

  async deleteUser(phone: string) {
    const userFromDB = await this.userModel.findOne({ phone })
    if (!userFromDB) {
      throw new HttpException('No such user', HttpStatus.NOT_FOUND)
    }

    if (userFromDB.isAdmin) {
      throw new HttpException(
        'Can not delete this profile',
        HttpStatus.FORBIDDEN
      )
    }

    const oldAvatarFile = userFromDB.avatarFile ? userFromDB.avatarFile : null
    await this.userModel.deleteOne({ phone })
    if (oldAvatarFile) {
      this.minioClientService.deleteFile('avatars', oldAvatarFile)
    }
    return `User ${phone} успешно удален`
  }

  async setName(phone: string, setNameInput: SetNameInput) {
    let { name } = setNameInput
    name = name.trim()
    if (!this.validateName(name)) {
      throw new HttpException('Incorrect profile name', HttpStatus.BAD_REQUEST)
    }

    const user = await this.userModel.findOne({ phone })
    if (!user) {
      throw new HttpException('No such user', HttpStatus.NOT_FOUND)
    }

    if (user.isAdmin) {
      throw new HttpException(
        'Can not change this profile',
        HttpStatus.FORBIDDEN
      )
    }

    user.name = name
    await user.save()

    const profile = user.toObject() as GetProfileResponse
    profile.statistics = await this.routeService.calcUserStatistics(user._id)
    this.pubSub.publish('profileChanged', { watchProfile: profile })

    return profile
  }

  async setProfleStatus(phone: string, setStatusInput: SetStatusInput) {
    const { status } = setStatusInput

    const user = await this.userModel.findOne({ phone })
    if (!user) {
      throw new HttpException('No such user', HttpStatus.NOT_FOUND)
    }

    if (user.isAdmin) {
      throw new HttpException(
        'Can not change this profile',
        HttpStatus.FORBIDDEN
      )
    }

    user.status = status
    await user.save()

    const profile = user.toObject() as GetProfileResponse
    profile.statistics = await this.routeService.calcUserStatistics(user._id)
    this.pubSub.publish('profileChanged', { watchProfile: profile })

    return profile
  }

  async setProfileAvatar(phone: string) {
    const user = await this.userModel.findOne({ phone })
    if (!user) {
      throw new HttpException('No such user', HttpStatus.NOT_FOUND)
    }

    const filename = String(Date.now()) + '_' + user._id.toString() + '.jpg'
    console.log('We are to upload file ', filename)

    this.minioClientService.listenForFileUploaded('avatars', filename).then(
      async (value) => {
        if (value) {
          console.log('Avatar Uploaded:', value)
          const avatar = await this.minioClientService.getDownloadLink({
            bucketName: 'avatars',
            objectName: value as string,
            expiry: 7 * 24 * 60 * 60
          })
          const oldAvatarFile = user.avatarFile ? user.avatarFile : null
          user.avatar = avatar
          user.avatarFile = value as string
          await user.save()
          if (oldAvatarFile) {
            this.minioClientService.deleteFile('avatars', oldAvatarFile)
          }

          const profile = {
            _id: user._id,
            phone: user.phone,
            name: user.name,
            avatar: user.avatar,
            statistics: await this.routeService.calcUserStatistics(user._id)
          }
          this.pubSub.publish('profileChanged', { watchProfile: profile })
        }
      },
      (reason) => {
        console.log(reason)
      }
    )

    return await this.minioClientService.getUploadLink({
      bucketName: 'avatars',
      objectName: filename,
      expiry: 300
    })
  }

  async setProfileAvatarByUpload(
    phone: string,
    createReadStream: { (): Readable; (): string | Readable | Buffer },
    filename: string
  ) {
    const user = await this.userModel.findOne({ phone })
    if (!user) {
      throw new HttpException('No such user', HttpStatus.NOT_FOUND)
    }

    const timestamp = Date.now().toString()
    const extension = filename.substring(
      filename.lastIndexOf('.'),
      filename.length
    )

    // We need to append the extension at the end otherwise Minio will save it as a generic file
    const avatarName = timestamp + phone + extension

    const res = await this.minioClientService.singleUpload(
      'avatars',
      createReadStream,
      avatarName
    )

    const oldAvatarFile = user.avatarFile ? user.avatarFile : null
    user.avatar = avatarName
    await user.save()
    if (oldAvatarFile) {
      this.minioClientService.deleteFile('avatars', oldAvatarFile)
    }

    return res
  }

  async deleteProfileAvatar(phone: string) {
    const user = await this.userModel.findOne({ phone })
    if (!user) {
      throw new HttpException('No such user', HttpStatus.NOT_FOUND)
    }

    const oldAvatarFile = user.avatarFile ? user.avatarFile : null
    user.avatar = null
    user.avatarFile = null
    await user.save()
    if (oldAvatarFile) {
      this.minioClientService.deleteFile('avatars', oldAvatarFile)
    }

    const profile = user.toObject() as GetProfileResponse
    profile.statistics = await this.routeService.calcUserStatistics(user._id)
    this.pubSub.publish('profileChanged', { watchProfile: profile })

    return profile
  }

  validateName(name: string): boolean {
    return /^[A-Za-zа-яёA-ЯЁ ]+$/.test(name)
  }
}
