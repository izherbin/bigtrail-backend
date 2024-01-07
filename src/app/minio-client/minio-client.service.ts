import { Injectable } from '@nestjs/common'
import { MinioService } from 'nestjs-minio-client'

@Injectable()
export class MinioClientService {
  constructor(private readonly minioService: MinioService) {}

  async listAllBuckets() {
    return await this.minioService.client.listBuckets()
  }
}
