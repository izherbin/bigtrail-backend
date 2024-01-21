import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from '../auth/entities/user.entity'
import { Model } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import { SetNameInput } from './dto/set-name.input'
import { Readable } from 'stream'
import { MinioClientService } from '../minio-client/minio-client.service'
import { PubSub } from 'graphql-subscriptions'
import { GetUserResponce } from './dto/get-user.response'

const pubSub = new PubSub()

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly minioClientService: MinioClientService
  ) {}

  async getProfileQuery(phone: string) {
    const user = await this.userModel.findOne({ phone })

    return user as GetUserResponce
  }

  getProfile() {
    const res = pubSub.asyncIterator('profileChanged')
    return res
  }

  async getUser(phone: string) {
    const user = await this.userModel.findOne({ phone })
    return user
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

    await this.userModel.deleteOne({ phone })
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

    const profile = user as GetUserResponce
    pubSub.publish('profileChanged', { getProfile: profile })

    return profile
  }

  async setProfileAvatar(phone: string) {
    const user = await this.userModel.findOne({ phone })
    if (!user) {
      throw new HttpException('No such user', HttpStatus.NOT_FOUND)
    }

    const filename = String(Date.now()) + '_' + phone + '.jpg'
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
          user.avatar = avatar
          user.avatarFile = value as string
          user.save()

          const profile = {
            phone: user.phone,
            name: user.name,
            avatar: user.avatar
          }
          pubSub.publish('profileChanged', { getProfile: profile })
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

    user.avatar = avatarName
    user.save()

    return res
  }

  async deleteProfileAvatar(phone: string) {
    const user = await this.userModel.findOne({ phone })
    if (!user) {
      throw new HttpException('No such user', HttpStatus.NOT_FOUND)
    }

    user.avatar = null
    user.avatarFile = null
    await user.save()
    return user as GetUserResponce
  }

  validateName(name: string): boolean {
    return /^[A-Za-zа-яёA-ЯЁ ]+$/.test(name)
  }
}
