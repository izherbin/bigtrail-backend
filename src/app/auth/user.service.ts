import { ForbiddenException, Injectable } from '@nestjs/common'
import { LoginPhoneInput } from './dto/login-phone.input'
import { User } from './entities/user.entity'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { catchError /*, lastValueFrom, map */ } from 'rxjs'

@Injectable()
export class UserService {
  constructor(
    public user: User,
    private readonly configService: ConfigService,
    private http: HttpService
  ) {}

  async createUser(loginPhoneInput: LoginPhoneInput) {
    this.user.phone = loginPhoneInput.phone

    this.user.code = Math.round(Math.random() * 899999 + 100000)
    console.log('!!!!!this.user.code:', this.user.code)

    const request = this.http
      .post(
        'https://api.releans.com/v2/message',
        {},
        {
          params: {
            sender: this.configService.get<string>('SMS_SENDER_NAME'),
            mobile: '+' + loginPhoneInput.phone,
            content: 'Your code is : ' + this.user.code
          },
          headers: {
            Authorization:
              'Bearer ' + this.configService.get<string>('SMS_API_KEY')
          }
        }
      )
      // .pipe(map((res) => res.status))
      .pipe(
        catchError(() => {
          throw new ForbiddenException('API not available')
        })
      )
    // const status = await lastValueFrom(request)
    console.log('request:', request)

    this.user.tsSMSSent = Date.now()

    return this.user
  }

  removeUser() {
    this.user.phone = null
    this.user.tsSMSSent = null
    this.user.code = null

    return true
  }
}
