// import { Stream } from 'stream'

import { Readable } from 'stream'

export interface BufferedFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: AppMimeType
  size: number
  buffer: Buffer | string
}

export interface StoredFile extends HasFile, StoredFileMetadata {}

export interface HasFile {
  file: Buffer | string
}

export interface StoredFileMetadata {
  id: string
  name: string
  encoding: string
  mimetype: AppMimeType
  size: number
  updatedAt: Date
  fileSrc?: string
}

export interface FileUpload {
  filename: string
  mimetype: string
  encoding: string
  createReadStream: () => Readable
}

export type AppMimeType = 'image/png' | 'image/jpeg'
