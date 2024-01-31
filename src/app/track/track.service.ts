import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateTrackInput } from './dto/create-track.input'
import { UpdateTrackInput } from './dto/update-track.input'
import { InjectModel } from '@nestjs/mongoose'
import { Track, TrackDocument, TrackPhoto } from './entities/track.entity'
import { Model, Schema as MongooSchema } from 'mongoose'
import { DeleteTrackInput } from './dto/delete-track.input'
import { PubSub } from 'graphql-subscriptions'
import { SubscriptionTrackResponse } from './dto/subscription-track.response'
import { UploadPhoto } from './dto/upload-photo.response'
import { MinioClientService } from '../minio-client/minio-client.service'

const pubSub = new PubSub()

@Injectable()
export class TrackService {
  constructor(
    @InjectModel(Track.name)
    private trackModel: Model<TrackDocument>,
    private readonly minioClientService: MinioClientService
  ) {}

  async create(
    userId: MongooSchema.Types.ObjectId,
    createTrackInput: CreateTrackInput
  ) {
    const uploads = []
    const downloads = []
    for (const n in createTrackInput.notes) {
      for (const p in createTrackInput.notes[n].photos) {
        const photo = await this.uploadPhoto(
          createTrackInput.notes[n].photos[p]
        )
        if (photo) {
          uploads.push(photo.upload)
          downloads.push(photo.download)
        }
      }
    }

    Promise.allSettled(downloads).then(async () => {
      const createTrack = new this.trackModel(createTrackInput)
      createTrack.userId = userId

      const track: Track = await createTrack.save()
      track.id = track._id.toString()

      const emit: SubscriptionTrackResponse = {
        function: 'ADD',
        id: track._id,
        data: track as Track,
        userId: track.userId
      }
      pubSub.publish('trackChanged', { watchTracks: emit })
    })

    return uploads
  }

  async uploadPhoto(trackPhoto: TrackPhoto) {
    const { id } = trackPhoto
    if (!id) {
      console.log('Upload photo request without proper id: ', trackPhoto)
      return null
    }

    const filename = String(Date.now()) + '_' + id
    const download = this.minioClientService
      .listenForFileUploaded('photos', filename)
      .then(
        async (value: string) => {
          if (value) {
            console.log('Photo Uploaded:', value)
            trackPhoto.uri = await this.minioClientService.getDownloadLink({
              bucketName: 'photos',
              objectName: value as string,
              expiry: 7 * 24 * 60 * 60
            })
            trackPhoto.filename = value as string
          }
        },
        async (reason: string) => {
          console.log('Unsuccessfull uploading photo: ', id, reason)
          trackPhoto.uri = null
        }
      )

    const url = await this.minioClientService.getUploadLink({
      bucketName: 'photos',
      objectName: filename,
      expiry: 300
    })
    const upload: UploadPhoto = { url, id }
    return { upload, download }
  }

  async findAll() {
    const tracks = await this.trackModel.find()
    return tracks
  }

  async findByUserId(userId: MongooSchema.Types.ObjectId) {
    const tracks = await this.trackModel.find({ userId })
    return tracks
  }

  watchTracks() {
    const res = pubSub.asyncIterator('trackChanged')
    return res
  }

  findOne(id: number) {
    return `This action returns a #${id} track`
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, _updateTrackInput: UpdateTrackInput) {
    return `This action updates a #${id} track`
  }

  async remove(
    userId: MongooSchema.Types.ObjectId,
    deleteTrackInput: DeleteTrackInput
  ) {
    const { id } = deleteTrackInput
    const track = await this.trackModel.findById(id)
    if (!track) {
      throw new HttpException('No such user', HttpStatus.NOT_FOUND)
    }

    if (track.userId.toString() !== userId.toString()) {
      throw new HttpException(
        'Impossible to delete someone else`s track',
        HttpStatus.FORBIDDEN
      )
    }

    await this.trackModel.findByIdAndDelete(id)

    const emit: SubscriptionTrackResponse = {
      function: 'DELETE',
      id: track._id,
      userId: track.userId
    }
    pubSub.publish('trackChanged', { watchTracks: emit })

    return `Успешно удален трек № ${id} `
  }

  async calcUserTrackStatistics(userId: MongooSchema.Types.ObjectId) {
    const tracks = await this.trackModel.find({ userId })
    let duration = 0
    let distance = 0
    tracks.forEach((route) => {
      duration += route.duration
      distance += route.distance
    })

    const res = {
      duration,
      distance
    }
    return res
  }
}
