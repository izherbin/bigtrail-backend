import { Strategy } from 'passport-local'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from './auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'phone',
      passwordField: 'code'
    })
  }

  async validate(phone: string, code: number) {
    const user = await this.authService.validateUser(phone, code)

    if (!user) {
      throw new UnauthorizedException('Code is incorrect')
    }

    return user
  }
}
