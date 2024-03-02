import { Injectable } from '@nestjs/common'
import { CreatePlaceInput } from './dto/create-place.input'
// import { UpdatePlaceInput } from './dto/update-place.input'
import { InjectModel } from '@nestjs/mongoose'
import { Place, PlaceDocument } from './entities/place.entity'
import { MinioClientService } from '../minio-client/minio-client.service'
import { Document, Model, Schema as MongooSchema, Types } from 'mongoose'
import { TrackService } from '../track/track.service'
import { GetPlaceInput } from './dto/get-place.input'
import { ClientException } from '../client.exception'

@Injectable()
export class PlaceService {
  constructor(
    @InjectModel(Place.name)
    private placeModel: Model<PlaceDocument>,
    private readonly minioClientService: MinioClientService,
    private readonly trackService: TrackService
  ) {}
  async create(
    userId: MongooSchema.Types.ObjectId,
    createPlaceInput: CreatePlaceInput
  ) {
    const uploads = []
    const downloads = []
    for (const p in createPlaceInput.photos) {
      const photo = await this.trackService.uploadPhoto(
        createPlaceInput.photos[p]
      )
      if (photo) {
        uploads.push(photo.upload)
        downloads.push(photo.download)
      }
    }

    Promise.allSettled(downloads).then(async () => {
      const createPlace = new this.placeModel(createPlaceInput)
      createPlace.userId = userId
      createPlace.timestamp = Date.now()

      const place = await createPlace.save()
      console.log(`Place with _id: ${place._id} successfully saved`)
    })

    return uploads
  }

  async getPlace(getPlaceInput: GetPlaceInput) {
    const { id } = getPlaceInput
    const place = await this.renewOnePlacePhotos(
      await this.placeModel.findById(id)
    )
    if (!place) {
      throw new ClientException(40403)
    }

    return place as Place
  }

  findAll() {
    return `This action returns all place`
  }

  findOne(id: number) {
    return `This action returns a #${id} place`
  }

  // update(id: number, updatePlaceInput: UpdatePlaceInput) {
  //   return `This action updates a #${id} place`
  // }

  remove(id: number) {
    return `This action removes a #${id} place`
  }

  async renewOnePlacePhotos(
    place: Document<unknown, object, PlaceDocument> &
      Place &
      Document<any, any, any> & { _id: Types.ObjectId }
  ) {
    if (!place) {
      throw new ClientException(40403)
    }

    let shouldSave = false
    const renews = []
    for (const photo of place?.photos) {
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

    return Promise.allSettled(renews).then(() => {
      if (shouldSave) {
        place.markModified('photos')
        return place.save()
      } else {
        return place
      }
    })
  }
}
