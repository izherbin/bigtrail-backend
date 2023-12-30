import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from '../auth/entities/user.entity'
import { Model } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import { SetNameInput } from './dto/set-name.input'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly configService: ConfigService
  ) {}

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
    return await userFromDB.updateOne(user)
  }

  async setName(phone: string, setNameInput: SetNameInput) {
    const { name } = setNameInput
    const user = await this.userModel.findOne({ phone })
    if (!user) {
      throw new HttpException('No such user', HttpStatus.NOT_FOUND)
    }

    user.name = name
    await user.save()
    return 'Name set successfully'
  }
}
