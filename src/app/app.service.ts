import { Injectable } from '@nestjs/common'
import { execSync } from 'child_process'
import { Schema as MongooSchema } from 'mongoose'

@Injectable()
export class AppService {
  getHello(): string {
    return 'If you read this you have been authorized successfully'
  }

  getCommitInfo(): string {
    const out = execSync('git show --pretty="%h %ar %s" HEAD')
      .toString()
      .split('\n')
    return out[0]
  }

  whoAmI(phone: string): string {
    return 'Your phone is: ' + phone
  }

  myId(_id: MongooSchema.Types.ObjectId): string {
    return 'Your Id is: ' + _id.toString()
  }
}
