import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BucketItem } from 'minio'
import { MinioService } from 'nestjs-minio-client'
import { PresignedLinkInput } from './dto/presigned-link.input.dto'
import { ConfigService } from '@nestjs/config'
import { UploadFileInput } from './dto/upload-file.dto'
import { Readable } from 'stream'

const FILE_UPLOAD_TIMEOUT = 60000 * 5

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

  async getDownloadLink(downloadLinkInput: PresignedLinkInput) {
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

  async getUploadLink(uploadLinkInput: PresignedLinkInput) {
    const { bucketName, objectName, expiry } = uploadLinkInput

    const link: string = await this.minioService.client
      .presignedPutObject(bucketName, objectName, expiry)
      .catch((err) => {
        console.log('Error calculating upload link:', err)
        throw new HttpException(
          'Error calculating upload link',
          HttpStatus.BAD_REQUEST
        )
      })
    return link
  }

  listenForFileUploaded(bucketName: string, filename: string) {
    const emitter = this.minioService.client.listenBucketNotification(
      bucketName,
      filename,
      '',
      ['s3:ObjectCreated:*']
    )
    const res = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('Timeout uploading avatar')
      }, FILE_UPLOAD_TIMEOUT)

      emitter.addListener('notification', async (record) => {
        if (filename === record.s3.object.key) {
          emitter.removeAllListeners()
          resolve(filename)
        } else {
          reject('Error uploading avatar:' + filename)
        }
      })
    })
    return res
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

  async singleUpload(
    bucketName: string,
    createReadStream: { (): Readable; (): string | Readable | Buffer },
    filename: string
  ) {
    const res = await this.minioService.client
      .putObject(bucketName, filename, createReadStream())
      .catch((err) => {
        console.log('Error uploading file:', err)
        throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST)
      })

    return res
  }
}
