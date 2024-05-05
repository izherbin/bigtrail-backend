import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Role, User, UserDocument } from './entities/user.entity'
import { Document, Model, Schema as MongooSchema, Types } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import { SetNameInput } from './dto/set-name.input'
import { Readable } from 'stream'
import { MinioClientService } from '../minio-client/minio-client.service'
import { GetProfileResponse } from './dto/get-profile.response'
import { PubSubEngine } from 'graphql-subscriptions'
import { SetStatusInput } from './dto/set-status.input'
import { ClientException } from '../client.exception'
import * as bcrypt from 'bcrypt'

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

  async getUsers(): Promise<GetProfileResponse[]> {
    const users = await this.renewProfileAvatarMany(
      await this.userModel.find({
        $or: [
          { roles: { $exists: false } },
          { roles: { $size: 0 } },
          { roles: { $size: 1, $in: ['user'] } }
        ]
      })
    )
    return users
  }

  watchProfile() {
    const res = this.pubSub.asyncIterator('profileChanged')
    return res
  }

  async getUserByPhone(phone: string) {
    const user = await this.userModel.findOne({ phone })
    return user
  }

  async getUserByLogin(login: string) {
    const user = await this.userModel.findOne({ login })
    return user
  }

  async getUserById(id: MongooSchema.Types.ObjectId) {
    const user = await this.userModel.findById(id)
    if (!user) {
      throw new ClientException(40410)
    }

    return user
  }

  async getAdminStatistics() {
    return await this.userModel
      .countDocuments({
        $or: [{ roles: { $exists: false } }, { roles: { $in: ['user'] } }]
      })
      .exec()
  }

  async createUser(phone: string, ip: string) {
    const user = await this.userModel.findOne({ phone })
    if (user) {
      throw new ClientException(40902)
    }
    const tsCreated = new Date().getTime()
    const res = await this.userModel.insertMany([
      { phone, ip, tsCreated, roles: [Role.User] }
    ])
    return res[0]
  }

  async createAdmin(login: string, passwd: string): Promise<string> {
    const admin = await this.userModel.findOne({ login })
    if (admin) {
      throw new ClientException(40903)
    }
    const password = await bcrypt.hash(
      passwd,
      Number(this.configService.get('SALT_ROUND'))
    )
    await this.userModel.insertMany([
      { login, password, phone: 'N/A', roles: [Role.Admin] }
    ])
    return `Админ ${login} успешно создан`
  }

  async createModerator(login: string, passwd: string): Promise<string> {
    const moderator = await this.userModel.findOne({ login })
    if (moderator) {
      throw new ClientException(40904)
    }
    const password = await bcrypt.hash(
      passwd,
      Number(this.configService.get('SALT_ROUND'))
    )
    await this.userModel.insertMany([
      { login, password, phone: 'N/A', roles: [Role.Moderator] }
    ])
    return `Модератор ${login} успешно создан`
  }

  async createVerifier(login: string, passwd: string): Promise<string> {
    const verifier = await this.userModel.findOne({ login })
    if (verifier) {
      throw new ClientException(40905)
    }
    const password = await bcrypt.hash(
      passwd,
      Number(this.configService.get('SALT_ROUND'))
    )
    await this.userModel.insertMany([
      { login, password, phone: 'N/A', roles: [Role.Verifier] }
    ])
    return `Верификатор ${login} успешно создан`
  }

  async updateUser(user: User) {
    const userFromDB = await this.userModel.findOne({ phone: user.phone })
    if (!userFromDB) {
      throw new ClientException(40410)
    }

    if (userFromDB.roles.includes(Role.Admin)) {
      throw new ClientException(40303)
    }

    return await userFromDB.updateOne(user)
  }

  async deleteUser(phone: string) {
    const userFromDB = await this.userModel.findOne({ phone })
    if (!userFromDB) {
      throw new ClientException(40410)
    }

    if (userFromDB.roles.includes(Role.Admin)) {
      throw new ClientException(40304)
    }

    const oldAvatarFile = userFromDB.avatarFile ? userFromDB.avatarFile : null
    await this.userModel.deleteOne({ phone })
    if (oldAvatarFile) {
      this.minioClientService.deleteFile('avatars', oldAvatarFile)
    }
    return `User ${phone} успешно удален`
  }

  async deleteAdmin(login: string) {
    const adminFromDB = await this.userModel.findOne({ login })
    if (!adminFromDB) {
      throw new ClientException(40409)
    }

    const oldAvatarFile = adminFromDB.avatarFile ? adminFromDB.avatarFile : null
    await this.userModel.deleteOne({ login })
    if (oldAvatarFile) {
      this.minioClientService.deleteFile('avatars', oldAvatarFile)
    }
    return `Admin ${login} успешно удален`
  }

  async deleteModerator(login: string) {
    const moderatorFromDB = await this.userModel.findOne({ login })
    if (!moderatorFromDB) {
      throw new ClientException(40411)
    }

    const oldAvatarFile = moderatorFromDB.avatarFile
      ? moderatorFromDB.avatarFile
      : null
    await this.userModel.deleteOne({ login })
    if (oldAvatarFile) {
      this.minioClientService.deleteFile('avatars', oldAvatarFile)
    }
    return `Moderator ${login} успешно удален`
  }

  async deleteVerifier(login: string) {
    const verifierFromDB = await this.userModel.findOne({ login })
    if (!verifierFromDB) {
      throw new ClientException(40412)
    }

    const oldAvatarFile = verifierFromDB.avatarFile
      ? verifierFromDB.avatarFile
      : null
    await this.userModel.deleteOne({ login })
    if (oldAvatarFile) {
      this.minioClientService.deleteFile('avatars', oldAvatarFile)
    }
    return `Verifier ${login} успешно удален`
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
      throw new ClientException(40410)
    }

    if (user.roles.includes(Role.Admin)) {
      throw new ClientException(40303)
    }

    user.name = name
    await user.save()

    const profile = user.toObject() as GetProfileResponse
    this.pubSub.publish('profileChanged', { watchProfile: profile })

    return profile
  }

  async setAdminPassword(login: string, password: string): Promise<string> {
    if (!this.validatePassword(password)) {
      throw new ClientException(40008)
    }

    const admin = await this.getUserByLogin(login)
    if (!admin) {
      throw new ClientException(40409)
    }

    admin.password = password
    await admin.save()

    return `Пароль администратора ${login} успешно изменен`
  }

  async setModeratorPassword(login: string, password: string): Promise<string> {
    if (!this.validatePassword(password)) {
      throw new ClientException(40008)
    }

    const moderator = await this.getUserByLogin(login)
    if (!moderator) {
      throw new ClientException(40411)
    }

    moderator.password = password
    await moderator.save()

    return `Пароль модератора ${login} успешно изменен`
  }

  async setVerifierPassword(login: string, password: string): Promise<string> {
    if (!this.validatePassword(password)) {
      throw new ClientException(40008)
    }

    const verifier = await this.getUserByLogin(login)
    if (!verifier) {
      throw new ClientException(40412)
    }

    verifier.password = password
    await verifier.save()

    return `Пароль верификатора ${login} успешно изменен`
  }

  async setProfleStatus(phone: string, setStatusInput: SetStatusInput) {
    const { status } = setStatusInput

    const user = await this.renewProfileAvatar(
      await this.userModel.findOne({ phone })
    )
    if (!user) {
      throw new ClientException(40410)
    }

    if (user.roles.includes(Role.Admin)) {
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
      throw new ClientException(40410)
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
      throw new ClientException(40410)
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
      throw new ClientException(40410)
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

  async renewProfileAvatarMany(
    users: (Document<unknown, object, UserDocument> &
      User &
      Document<any, any, any> & { _id: Types.ObjectId })[]
  ) {
    const promises = users.map((user) => this.renewProfileAvatar(user))
    return Promise.all(promises)
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

  validateLogin(login: string): boolean {
    return /.*/.test(login)
  }

  validatePassword(password: string): boolean {
    return /.*/.test(password)
  }

  async getContentOwnerId() {
    const contentOwner = await this.userModel.findOne({
      login: this.configService.get('CONTENT_OWNER')
    })
    if (!contentOwner) {
      throw new ClientException(40413)
    }

    return contentOwner._id
  }
}
