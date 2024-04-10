import { Strategy } from 'passport-local'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { ClientException } from '../client.exception'

@Injectable()
export class PasswordStrategy extends PassportStrategy(Strategy, 'password') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'login',
      passwordField: 'password'
    })
  }

  async validate(login: string, password: string) {
    const user = await this.authService.validateAdmin(login, password)

    if (!user) {
      throw new ClientException(40101)
    }

    return user
  }
}
