import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthResolver } from './auth.resolver'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { JwtModule, JwtModuleOptions, JwtService } from '@nestjs/jwt'
import { JwtStrategy } from './jwt.strategy'
import { PhoneStrategy } from './phone.strategy'
import { PasswordStrategy } from './password.strategy'
import { User, UserSchema } from '../user/entities/user.entity'
import { HttpModule } from '@nestjs/axios'
import { UserModule } from '../user/user.module'
import { UserService } from '../user/user.service'
import { MongooseModule } from '@nestjs/mongoose'
import { MinioClientModule } from '../minio-client/minio-client.module'

@Module({
  providers: [
    AuthService,
    AuthResolver,
    JwtService,
    JwtStrategy,
    PasswordStrategy,
    PhoneStrategy,
    UserService
  ],
  imports: [
    UserModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HttpModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const properties: JwtModuleOptions = {
          secret: configService.get<string>('JWT_SECRET')
        }
        return properties
      }
    }),
    MinioClientModule
  ],
  exports: [AuthService]
})
export class AuthModule {}
