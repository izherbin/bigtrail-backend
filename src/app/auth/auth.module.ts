import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthResolver } from './auth.resolver'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { JwtModule, JwtModuleOptions, JwtService } from '@nestjs/jwt'
import { JwtStrategy } from './jwt.strategy'
import { LocalStrategy } from './local.strategy'
import { UserService } from './user.service'
import { User } from './entities/user.entity'
import { HttpModule } from '@nestjs/axios'

@Module({
  providers: [
    AuthService,
    AuthResolver,
    JwtService,
    JwtStrategy,
    LocalStrategy,
    UserService,
    User
  ],
  imports: [
    HttpModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const properties: JwtModuleOptions = {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: '24h'
          }
        }
        return properties
      }
    })
  ]
})
export class AuthModule {}
