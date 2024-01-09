import { Module } from '@nestjs/common'
import { MinioModule } from 'nestjs-minio-client'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MinioClientService } from './minio-client.service'
import { MinioClientResolver } from './minio-client.resolver'

@Module({
  imports: [
    MinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          endPoint: config.get('MINIO_ENDPOINT'),
          port: parseInt(config.get('MINIO_PORT')),
          useSSL: false,
          accessKey: config.get('MINIO_ACCESS_KEY'),
          secretKey: config.get('MINIO_SECRET_KEY')
        }
      }
    }),
    ConfigModule.forRoot({
      cache: true
    })
  ],
  providers: [MinioClientResolver, MinioClientService],
  exports: [MinioClientService]
})
export class MinioClientModule {}
