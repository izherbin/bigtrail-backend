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
import { RouteModule } from './route/route.module'
import { VersionModule } from './version/version.module'
import { GeocodingModule } from './geocoding/geocoding.module'
import { PlaceModule } from './place/place.module'
import { SurveyModule } from './survey/survey.module'
import { FavoritesModule } from './favorites/favorites.module'
import { AdminModule } from './admin/admin.module'
import { ReviewModule } from './review/review.module'
import { NotificationModule } from './notification/notification.module'

interface Extra {
  request: {
    headers: object
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
            // console.log('extra: ', extra)
            return { req: extra.request }
          },
          onConnect: (context: Context<any>) => {
            const { connectionParams, extra } = context
            // console.log(
            //   'connectionParams:',
            //   JSON.stringify(connectionParams, null, '  ')
            // )
            const tokenStr = connectionParams?.headers?.Authorization
              ? connectionParams?.headers?.Authorization
              : connectionParams?.Authorization
            if (tokenStr) {
              ;(extra as Extra).request.headers['authorization'] = tokenStr
            }
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
    MinioClientModule,
    RouteModule,
    VersionModule,
    GeocodingModule,
    PlaceModule,
    SurveyModule,
    FavoritesModule,
    AdminModule,
    ReviewModule,
    NotificationModule
  ],
  controllers: [],
  providers: [AppResolver, AppService]
})
export class AppModule {}
