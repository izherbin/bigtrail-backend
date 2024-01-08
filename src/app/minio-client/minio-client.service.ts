import { Injectable } from '@nestjs/common'
import { BucketItem } from 'minio'
import { MinioService } from 'nestjs-minio-client'
import { DownloadLinkInput } from './dto/download-link.input.dto'

@Injectable()
export class MinioClientService {
  constructor(private readonly minioService: MinioService) {}

  async listAllBuckets() {
    return await this.minioService.client.listBuckets()
  }

  async listObjectsInBucket(name: string) {
    const list: BucketItem[] = await new Promise((resolve, reject) => {
      const stream = this.minioService.client.listObjects(name)
      const listTemp: BucketItem[] = []
      stream.on('data', (obj) => listTemp.push(obj))
      stream.on('error', (err) => reject(err))
      stream.on('end', () => resolve(listTemp))
    })
    return list
  }

  async getDownloadLink(downloadLinkInput: DownloadLinkInput) {
    const { bucketName, objectName, expiry } = downloadLinkInput

    const link: string = await this.minioService.client.presignedGetObject(
      bucketName,
      objectName,
      expiry
    )
    return link
  }
}
