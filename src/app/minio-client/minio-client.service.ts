import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BucketItem } from 'minio'
import { MinioService } from 'nestjs-minio-client'
import { DownloadLinkInput } from './dto/download-link.input.dto'
import { ConfigService } from '@nestjs/config'
import { UploadFileInput } from './dto/upload-file.dto'

@Injectable()
export class MinioClientService {
  constructor(
    private readonly minioService: MinioService,
    private readonly configService: ConfigService
  ) {}

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

    const link: string = await this.minioService.client
      .presignedGetObject(bucketName, objectName, expiry)
      .catch((err) => {
        console.log('Error calculating download link:', err)
        throw new HttpException(
          'Error calculating download link',
          HttpStatus.BAD_REQUEST
        )
      })
    return link
  }

  async uploadFile(uploadFileInput: UploadFileInput) {
    const { bucketName, objectName, file } = uploadFileInput

    // const timestamp = Date.now().toString()
    // const hashedFileName = crypto
    //   .createHash('md5')
    //   .update(timestamp)
    //   .digest('hex')
    // const extension = file.originalname.substring(
    //   file.originalname.lastIndexOf('.'),
    //   file.originalname.length
    // )
    //
    // We need to append the extension at the end otherwise Minio will save it as a generic file
    // const fileName = hashedFileName + extension

    const res = await this.minioService.client
      .putObject(bucketName, objectName, (await file).createReadStream())
      .catch((err) => {
        console.log('Error calculating download link:', err)
        throw new HttpException(
          'Error calculating download link',
          HttpStatus.BAD_REQUEST
        )
      })

    return res
  }

  async singleUpload(createReadStream, filename) {
    const res = await this.minioService.client
      .putObject('test-images', filename, createReadStream())
      .catch((err) => {
        console.log('Error calculating download link:', err)
        throw new HttpException(
          'Error calculating download link',
          HttpStatus.BAD_REQUEST
        )
      })

    return 'File uploaded'
  }
}
