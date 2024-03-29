import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from './entities/user.entity'
import { Document, Model, Schema as MongooSchema, Types } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import { SetNameInput } from './dto/set-name.input'
import { Readable } from 'stream'
import { MinioClientService } from '../minio-client/minio-client.service'
import { GetProfileResponse } from './dto/get-profile.response'
import { PubSubEngine } from 'graphql-subscriptions'
import { SetStatusInput } from './dto/set-status.input'
import { ClientException } from '../client.exception'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly minioClientService: MinioClientService,
    @Inject('PUB_SUB') private pubSub: PubSubEngine
  ) {}

  async getProfileQuery(phone: string) {
    const user = await this.renewProfileAvatar(
      await this.userModel.findOne({ phone })
    )

    const profile = user.toObject() as GetProfileResponse
    return profile
  }

  async getProfileById(id: string) {
    const user = await this.renewProfileAvatar(
      await this.userModel.findById(id)
    )

    const profile = user.toObject() as GetProfileResponse
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

  async getUserById(id: MongooSchema.Types.ObjectId) {
    const user = await this.userModel.findById(id)
    if (!user) {
      throw new ClientException(40403)
    }

    return user
  }

  async createUser(phone: string) {
    const user = await this.userModel.findOne({ phone })
    if (user) {
      throw new ClientException(40902)
    }
    const res = await this.userModel.insertMany([{ phone }])
    return res[0]
  }

  async updateUser(user: User) {
    const userFromDB = await this.userModel.findOne({ phone: user.phone })
    if (!userFromDB) {
      throw new ClientException(40403)
    }

    if (userFromDB.isAdmin) {
      throw new ClientException(40303)
    }

    return await userFromDB.updateOne(user)
  }

  async deleteUser(phone: string) {
    const userFromDB = await this.userModel.findOne({ phone })
    if (!userFromDB) {
      throw new ClientException(40403)
    }

    if (userFromDB.isAdmin) {
      throw new ClientException(40304)
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
      throw new ClientException(40006)
    }

    const user = await this.renewProfileAvatar(
      await this.userModel.findOne({ phone })
    )
    if (!user) {
      throw new ClientException(40403)
    }

    if (user.isAdmin) {
      throw new ClientException(40303)
    }

    user.name = name
    await user.save()

    const profile = user.toObject() as GetProfileResponse
    this.pubSub.publish('profileChanged', { watchProfile: profile })

    return profile
  }

  async setProfleStatus(phone: string, setStatusInput: SetStatusInput) {
    const { status } = setStatusInput

    const user = await this.renewProfileAvatar(
      await this.userModel.findOne({ phone })
    )
    if (!user) {
      throw new ClientException(40403)
    }

    if (user.isAdmin) {
      throw new ClientException(40303)
    }

    user.status = status
    await user.save()

    const profile = user.toObject() as GetProfileResponse
    this.pubSub.publish('profileChanged', { watchProfile: profile })

    return profile
  }

  async setProfileAvatar(phone: string) {
    const user = await this.userModel.findOne({ phone })
    if (!user) {
      throw new ClientException(40403)
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

          const profile = user.toObject() as GetProfileResponse
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
      throw new ClientException(40403)
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
      throw new ClientException(40403)
    }

    const oldAvatarFile = user.avatarFile ? user.avatarFile : null
    user.avatar = null
    user.avatarFile = null
    await user.save()
    if (oldAvatarFile) {
      this.minioClientService.deleteFile('avatars', oldAvatarFile)
    }

    const profile = user.toObject() as GetProfileResponse
    this.pubSub.publish('profileChanged', { watchProfile: profile })

    return profile
  }

  async renewProfileAvatar(
    user: Document<unknown, object, UserDocument> &
      User &
      Document<any, any, any> & { _id: Types.ObjectId }
  ) {
    if (!user) {
      throw new ClientException(40404)
    }

    if (user?.avatar) {
      const newAvatar = await this.minioClientService.renewLink(user.avatar)
      if (newAvatar) {
        user.avatar = newAvatar
        await user.save()
      }
    }
    return user
  }

  validateName(name: string): boolean {
    return /^[A-Za-zа-яёA-ЯЁ ]+$/.test(name)
  }
}
