import { Module } from '@nestjs/common'
import { AppResolver } from './app.resolver'
import { AppService } from './app.service'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver } from '@nestjs/apollo'
import { join } from 'path'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose'
import { TrackModule } from './track/track.module'
@Module({
  imports: [
    GraphQLModule.forRoot({
      cors: true,
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const options: MongooseModuleOptions = {
          uri: configService.get<string>('DATABASE_URL')
        }

        return options
      }
    }),
    ConfigModule.forRoot({
      cache: true
    }),
    AuthModule,
    UserModule,
    TrackModule
  ],
  controllers: [],
  providers: [AppResolver, AppService]
})
export class AppModule {}
