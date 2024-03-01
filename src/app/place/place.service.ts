import { Injectable } from '@nestjs/common'
import { CreatePlaceInput } from './dto/create-place.input'
// import { UpdatePlaceInput } from './dto/update-place.input'
import { InjectModel } from '@nestjs/mongoose'
import { Place, PlaceDocument } from './entities/place.entity'
import { MinioClientService } from '../minio-client/minio-client.service'
import { Model, Schema as MongooSchema } from 'mongoose'
import { TrackService } from '../track/track.service'

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
}
