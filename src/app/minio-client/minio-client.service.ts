import { Injectable } from '@nestjs/common'
import { BucketItem } from 'minio'
import { MinioService } from 'nestjs-minio-client'
import { PresignedLinkInput } from './dto/presigned-link.input.dto'
import { ConfigService } from '@nestjs/config'
import { UploadFileInput } from './dto/upload-file.dto'
import { Readable } from 'stream'
import { isExpired, parseLink } from './is-expired'
import { ClientErrors, ClientException } from '../client.exception'

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
        throw new ClientException(
          ClientErrors['Error calculating download link'],
          err
        )
      })
    return link
  }

  async getUploadLink(uploadLinkInput: PresignedLinkInput) {
    const { bucketName, objectName, expiry } = uploadLinkInput

    const link: string = await this.minioService.client
      .presignedPutObject(bucketName, objectName, expiry)
      .catch((err) => {
        throw new ClientException(
          ClientErrors['Error calculating upload link'],
          err
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
        reject('Timeout uploading file')
      }, FILE_UPLOAD_TIMEOUT)

      emitter.addListener('notification', async (record) => {
        if (filename === record.s3.object.key) {
          emitter.removeAllListeners()
          resolve(filename)
        } else {
          reject('Error uploading file:' + filename)
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
        throw new ClientException(
          ClientErrors['Error calculating download link'],
          err
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
        throw new ClientException(ClientErrors['Error uploading file'], err)
      })

    return res
  }

  async deleteFile(bucketName: string, fileName: string) {
    await this.minioService.client.removeObject(bucketName, fileName)
  }

  async renewLink(link: string): Promise<string | null> {
    const query = parseLink(link)
    if (!query) return null

    if (isExpired(link)) {
      const { bucketName, objectName } = query
      const expiry = 7 * 24 * 60 * 60
      const res = this.getDownloadLink({ bucketName, objectName, expiry })
      return res
    } else {
      return null
    }
  }
}
