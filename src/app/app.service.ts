import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'If you read this you have been authorized successfully'
  }

  whoAmI(phone: string): string {
    return 'Your phone is: ' + phone
  }
}
