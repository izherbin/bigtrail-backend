import { Query, Resolver } from '@nestjs/graphql'
import { MinioClientService } from './minio-client.service'
import { BucketItemFromList } from './dto/minio-client.dto'

@Resolver()
export class MinioClientResolver {
  constructor(private readonly minioClientService: MinioClientService) {}

  @Query(() => [BucketItemFromList], {
    description: 'Выдача списка всех бакетов'
  })
  listAllBuckets() {
    return this.minioClientService.listAllBuckets()
  }
}
