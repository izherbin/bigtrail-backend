import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { MinioClientService } from './minio-client.service'
import { BucketItem, BucketItemFromList } from './dto/minio-client.dto'
import { PresignedLinkInput } from './dto/presigned-link.input.dto'
import { UploadFileInput, UploadedObjectInfo } from './dto/upload-file.dto'
import { FileUpload } from './file.model'
import { uploadScalar } from './upload-scalar.util'

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
    @Args('downloadLinkInput') downloadLinkInput: PresignedLinkInput
  ) {
    return this.minioClientService.getDownloadLink(downloadLinkInput)
  }

  @Query(() => String, {
    description: 'Получение временной ссылки на загрузку объекта в бакет'
  })
  getUploadLink(@Args('uploadLinkInput') uploadLinkInput: PresignedLinkInput) {
    return this.minioClientService.getUploadLink(uploadLinkInput)
  }

  @Mutation(() => UploadedObjectInfo, {
    name: 'uploadFile',
    description: 'Загрузить файл на сервер Minio'
  })
  async uploadFile(@Args('uploadFileInput') uploadFileInput: UploadFileInput) {
    return this.minioClientService.uploadFile(uploadFileInput)
  }

  @Mutation(() => UploadedObjectInfo, {
    name: 'singleUpload',
    description: 'Загрузить файл на сервер Minio'
  })
  async singleUpload(
    @Args({ name: 'file', type: uploadScalar })
    { createReadStream, filename }: FileUpload
  ) {
    return this.minioClientService.singleUpload(
      'test-images',
      createReadStream,
      filename
    )
  }
}
