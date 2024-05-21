import { Inject, Injectable } from '@nestjs/common'
import { CreateTrackInput } from './dto/create-track.input'
import { UpdateTrackInput } from './dto/update-track.input'
import { InjectModel } from '@nestjs/mongoose'
import { Track, TrackDocument, TrackPhoto } from './entities/track.entity'
import { Document, Model, Schema as MongooSchema, Types } from 'mongoose'
import { DeleteTrackInput } from './dto/delete-track.input'
import { PubSubEngine } from 'graphql-subscriptions'
import { SubscriptionTrackResponse } from './dto/subscription-track.response'
import { UploadPhoto } from './dto/upload-photo.response'
import { MinioClientService } from '../minio-client/minio-client.service'
import { UserService } from '../user/user.service'
import { ClientErrors, ClientException } from '../client.exception'
import { GetProfileResponse } from '../user/dto/get-profile.response'
import { ConfigService } from '@nestjs/config'
import { simplifyPoints } from './simplify'
import { TrackFilterInput } from './dto/track-filter.input'
import { TrackAdminFilterInput } from './dto/track-admin-filter.input'
import {
  distance2AltitudeGraph,
  time2DistanceGraph,
  time2SpeedGraph,
  trackStatistics
} from './track-statistics'
import { GetTrackGraphInput } from './dto/get-track-grqph.input'
import { GraphPoint } from './dto/graph-point'

@Injectable()
export class TrackService {
  constructor(
    @InjectModel(Track.name)
    private trackModel: Model<TrackDocument>,
    private readonly configService: ConfigService,
    private readonly minioClientService: MinioClientService,
    private readonly userService: UserService,
    @Inject('PUB_SUB') private pubSub: PubSubEngine
  ) {}

  async create(
    userId: MongooSchema.Types.ObjectId,
    createTrackInput: CreateTrackInput
  ) {
    const elevations = []
    for (const p in createTrackInput.points) {
      if (!createTrackInput.points[p].alt) {
        elevations.push(
          this.getElevation(
            createTrackInput.points[p].lat,
            createTrackInput.points[p].lon
          ).then((elev) => {
            createTrackInput.points[p].alt = elev
          })
        )
      }
    }

    const uploads = []
    const downloads = []
    for (const n in createTrackInput.notes) {
      if (createTrackInput.notes[n].point) {
        if (!createTrackInput.notes[n].point.alt) {
          elevations.push(
            this.getElevation(
              createTrackInput.notes[n].point.lat,
              createTrackInput.notes[n].point.lon
            ).then((elev) => {
              createTrackInput.notes[n].point.alt = elev
            })
          )
        }
      }

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

    Promise.allSettled(downloads.concat(elevations)).then(async () => {
      const createTrack = new this.trackModel(createTrackInput)
      createTrack.userId = userId
      createTrack.tsCreated = new Date().getTime()

      const track = await this.updateTrackStatistics(createTrack)
      await track.save()
      track.id = track._id.toString()

      const profile = await this.updateUserStatistics(userId)
      this.pubSub.publish('profileChanged', { watchProfile: profile })

      const emit: SubscriptionTrackResponse = {
        function: 'ADD',
        id: track._id,
        data: this.tracksSimplify(
          [track],
          Number(this.configService.get('TRACK_SIMPLIFY_COEFFICIENT'))
        )[0] as Track,
        userId: track.userId
      }
      this.pubSub.publish('trackChanged', { watchTracks: emit })
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

  async findByUserId(
    userId: MongooSchema.Types.ObjectId,
    trackFilterInput: TrackFilterInput
  ) {
    const tracks = await this.renewManyTracksPhotos(
      await this.trackModel.find()
    )

    const trackAdminFilterInput = {
      userId: userId.toString(),
      ...trackFilterInput
    }

    return this.filterTracks(tracks, trackAdminFilterInput)
  }

  async findAll(trackAdminFilterInput: TrackAdminFilterInput) {
    const tracks = await this.renewManyTracksPhotos(
      await this.trackModel.find()
    )

    return this.filterTracks(tracks, trackAdminFilterInput)
  }

  filterTracks(tracks: Track[], trackAdminFilterInput: TrackAdminFilterInput) {
    const { userId, id, simplify } = trackAdminFilterInput || {}

    let tracksFiltered: Track[]

    if (id) {
      tracksFiltered = tracks.filter((t) => t._id.toString() === id)
    } else {
      tracksFiltered = tracks
    }

    if (userId) {
      tracksFiltered = tracksFiltered.filter(
        (t) => t.userId.toString() === userId
      )
    }

    return this.tracksSimplify(
      tracksFiltered,
      Number(simplify || this.configService.get('TRACK_SIMPLIFY_COEFFICIENT'))
    )
  }

  watchTracks() {
    const res = this.pubSub.asyncIterator('trackChanged')
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
      throw new ClientException(ClientErrors['No such track'])
    }

    if (track.userId.toString() !== userId.toString()) {
      throw new ClientException(
        ClientErrors['Impossible to delete someone else`s track']
      )
    }

    await this.trackModel.findByIdAndDelete(id)

    const profile = await this.updateUserStatistics(userId)
    this.pubSub.publish('profileChanged', { watchProfile: profile })

    const emit: SubscriptionTrackResponse = {
      function: 'DELETE',
      id: track._id,
      userId: track.userId
    }
    this.pubSub.publish('trackChanged', { watchTracks: emit })

    return `Успешно удален трек № ${id} `
  }

  tracksSimplify(tracks: Track[], tolerance: number) {
    for (const track of tracks) {
      const pointsBefore = track.points.length
      track.points = simplifyPoints(track.points, tolerance, false)
      const pointsAfter = track.points.length
      console.log(
        `[TRACK SIMPLIFY STATISTICS]   Points before: ${pointsBefore}   Points after: ${pointsAfter}`
      )
    }
    return tracks
  }

  async updateUserStatistics(userId: MongooSchema.Types.ObjectId) {
    const user = await this.userService.getUserById(userId)
    if (!user.statistics) {
      user.statistics = {
        subscribers: 0,
        subscriptions: 0,
        places: 0,
        routes: 0,
        tracks: 0,
        duration: 0,
        distance: 0,
        points: 0,
        notificationsUnread: 0
      }
    }

    const tracks = await this.trackModel.find({ userId })
    let duration = 0
    let distance = 0
    tracks.forEach((route) => {
      duration += route.duration
      distance += route.distance
    })

    user.statistics.tracks = tracks.length
    user.statistics.duration = duration
    user.statistics.distance = distance
    user.statistics.points =
      user.statistics.routes *
        Number(this.configService.get<string>('POINTS_PER_ROUTE')) +
      user.statistics.tracks *
        Number(this.configService.get<string>('POINTS_PER_TRACK')) +
      user.statistics.places *
        Number(this.configService.get<string>('POINTS_PER_PLACE'))

    user.save()
    return user as GetProfileResponse
  }

  async updateTrackStatistics(
    track: Document<unknown, object, TrackDocument> &
      Track &
      Document<any, any, any> & { _id: Types.ObjectId }
  ) {
    track.statistics = await trackStatistics(track.points)
    track.markModified('statistics')
    return track
  }

  async getTrackGraph(
    getTrackGraphInput: GetTrackGraphInput
  ): Promise<GraphPoint[]> {
    const track = await this.trackModel.findById(getTrackGraphInput.id)
    if (!track) {
      throw new ClientException(ClientErrors['No such track'])
    }

    switch (getTrackGraphInput.type) {
      case 'TIME2DISTANCE':
        return await time2DistanceGraph(track.points)
      case 'TIME2SPEED':
        return time2SpeedGraph(track.points)
      case 'DISTANCE2ALTITUDE':
        return await distance2AltitudeGraph(track.points)
      default:
        throw new ClientException(ClientErrors['Illegal graph type'])
    }
  }

  async getAdminStatistics() {
    return await this.trackModel.countDocuments()
  }

  // TODO Realize elevation calculating
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getElevation(lat: number, lon: number) {
    // const elev = await elevation(lat, lon)
    const elev = null
    return elev
  }

  async renewManyTracksPhotos(
    tracks: (Document<unknown, object, TrackDocument> &
      Track &
      Document<any, any, any> & { _id: Types.ObjectId })[]
  ) {
    const renews = []
    const res = []
    for (const track of tracks) {
      renews.push(
        this.renewOneTrackPhotos(track).then((track) => {
          res.push(track)
        })
      )
    }

    await Promise.allSettled(renews)
    return res
  }

  async renewOneTrackPhotos(
    track: Document<unknown, object, TrackDocument> &
      Track &
      Document<any, any, any> & { _id: Types.ObjectId }
  ) {
    let shouldSave = false
    const renews = []
    for (const note of track?.notes) {
      if (!note.photos) continue

      for (const photo of note?.photos) {
        if (photo?.uri) {
          renews.push(
            this.minioClientService.renewLink(photo.uri).then((uri) => {
              if (uri) {
                photo.uri = uri
                shouldSave = true
              }
            })
          )
        }
      }
    }

    return Promise.allSettled(renews).then(() => {
      if (shouldSave) {
        track.markModified('notes')
        return track.save()
      } else {
        return track
      }
    })
  }
}
