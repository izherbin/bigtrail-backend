import { Args, Query, Resolver } from '@nestjs/graphql'
import { MinioClientService } from './minio-client.service'
import { BucketItem, BucketItemFromList } from './dto/minio-client.dto'
import { DownloadLinkInput } from './dto/download-link.input.dto'

@Resolver()
export class MinioClientResolver {
  constructor(private readonly minioClientService: MinioClientService) {}

  @Query(() => [BucketItemFromList], {
    description: 'Выдача списка всех бакетов'
  })
  listAllBuckets() {
    return this.minioClientService.listAllBuckets()
  }

  @Query(() => [BucketItem], {
    description: 'Выдача списка всех объектов в бакете'
  })
  listObjectsInBucket(
    @Args({ name: 'bucketName', description: 'Имя бакета' }) bucketName: string
  ) {
    return this.minioClientService.listObjectsInBucket(bucketName)
  }

  @Query(() => String, {
    description: 'Получение временной ссылки на скачивание объекта в бакете'
  })
  getDownloadLink(
    @Args('downloadLinkInput') downloadLinkInput: DownloadLinkInput
  ) {
    return this.minioClientService.getDownloadLink(downloadLinkInput)
  }
}
