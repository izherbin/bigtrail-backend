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
import { MinioClientModule } from './minio-client/minio-client.module'
import { Context } from 'graphql-ws'

interface Extra {
  request: {
    rawHeaders: string[]
  }
}

@Module({
  imports: [
    GraphQLModule.forRoot({
      cors: true,
      driver: ApolloDriver,
      subscriptions: {
        'graphql-ws': {
          context: ({ extra }) => {
            console.log('extra: ', extra)
            return { req: extra.request }
          },
          onConnect: (context: Context<any>) => {
            const { connectionParams, extra } = context
            const tokenStr = connectionParams?.headers?.Authorization
              ? connectionParams?.headers?.Authorization
              : null
            if (tokenStr) {
              ;(extra as Extra).request.rawHeaders.push('authosization')
              ;(extra as Extra).request.rawHeaders.push(tokenStr)
            }
            console.log(
              'extra.request:',
              JSON.stringify((extra as Extra).request, null, '  ')
            )
            // return {
            //   req: (extra as Extra).request
            // }
          }
        }
      },
      // installSubscriptionHandlers: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      upload: false,
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
    TrackModule,
    MinioClientModule
  ],
  controllers: [],
  providers: [AppResolver, AppService]
})
export class AppModule {}
