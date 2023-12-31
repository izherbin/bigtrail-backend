import { Injectable } from '@nestjs/common'
import { Schema as MongooSchema } from 'mongoose'

@Injectable()
export class AppService {
  getHello(): string {
    return 'If you read this you have been authorized successfully'
  }

  whoAmI(phone: string): string {
    return 'Your phone is: ' + phone
  }

  myId(_id: MongooSchema.Types.ObjectId): string {
    return 'Your Id is: ' + _id.toString()
  }
}
