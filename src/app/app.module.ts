import { Module } from '@nestjs/common'
import { AppResolver } from './app.resolver'
import { AppService } from './app.service'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver } from '@nestjs/apollo'
import { join } from 'path'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
@Module({
  imports: [
    GraphQLModule.forRoot({
      cors: true,
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()]
    }),
    ConfigModule.forRoot({
      cache: true
    }),
    AuthModule
  ],
  controllers: [],
  providers: [AppResolver, AppService]
})
export class AppModule {}
