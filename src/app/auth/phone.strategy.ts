import { Strategy } from 'passport-local'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { ClientErrors, ClientException } from '../client.exception'

@Injectable()
export class PhoneStrategy extends PassportStrategy(Strategy, 'phone') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'phone',
      passwordField: 'code'
    })
  }

  async validate(phone: string, code: number) {
    const user = await this.authService.validateUser(phone, code)

    if (!user) {
      throw new ClientException(ClientErrors['Code is incorrect'])
    }

    return user
  }
}
