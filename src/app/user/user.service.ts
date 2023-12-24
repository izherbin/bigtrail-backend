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

  async createUser(user: User) {
    const userFromDB = await this.userModel.findOne({ phone: user.phone })
    if (!userFromDB) {
      return await this.userModel.insertMany([user])
    }
    return await userFromDB.updateOne(user)
  }

  async setName(setNameInput: SetNameInput) {
    const { phone, name } = setNameInput
    const user = await this.userModel.findOne({ phone })
    if (!user) {
      throw new HttpException('No such user', HttpStatus.NOT_FOUND)
    }

    user.name = name
    await user.save()
    return 'Name set successfully'
  }
}
