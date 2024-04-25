import { Inject, Injectable } from '@nestjs/common'
import { CreatePlaceInput } from './dto/create-place.input'
// import { UpdatePlaceInput } from './dto/update-place.input'
import { InjectModel } from '@nestjs/mongoose'
import { Place, PlaceDocument } from './entities/place.entity'
import { MinioClientService } from '../minio-client/minio-client.service'
import { Document, Model, Schema as MongooSchema, Types } from 'mongoose'
import { TrackService } from '../track/track.service'
import { GetPlaceInput } from './dto/get-place.input'
import { ClientException } from '../client.exception'
import { DeletePlaceInput } from './dto/delete-place.input'
import { PlaceFilterInput } from './dto/place-filter.input'
import { PubSubEngine } from 'graphql-subscriptions'
import { SubscriptionPlaceResponse } from './dto/subscription-place.response'
import { UserService } from '../user/user.service'
import { GetProfileResponse } from '../user/dto/get-profile.response'
import { ConfigService } from '@nestjs/config'
import { FavoritesService } from '../favorites/favorites.service'
import { EditPlaceInput } from './dto/edit-place.input'

@Injectable()
export class PlaceService {
  constructor(
    @InjectModel(Place.name)
    private placeModel: Model<PlaceDocument>,
    private readonly minioClientService: MinioClientService,
    private readonly trackService: TrackService,
    private readonly configService: ConfigService,
    private readonly favoritesService: FavoritesService,
    private readonly userService: UserService,
    @Inject('PUB_SUB') private pubSub: PubSubEngine
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

      const profile = await this.updateUserStatistics(userId)
      this.pubSub.publish('profileChanged', { watchProfile: profile })

      const emit: SubscriptionPlaceResponse = {
        function: 'ADD',
        id: place._id,
        data: place as Place,
        userId: place.userId
      }
      this.pubSub.publish('placeChanged', { watchPlaces: emit })
    })

    return uploads
  }

  async getPlace(
    userId: MongooSchema.Types.ObjectId,
    getPlaceInput: GetPlaceInput
  ) {
    const { id } = getPlaceInput
    const place = await this.renewOnePlacePhotos(
      await this.placeModel.findById(id).catch((error) => {
        console.error(
          '\x1b[31m[Nest] - \x1b[37m',
          new Date().toLocaleString('en-EN'),
          '\x1b[31mERROR',
          '\x1b[33m[Exception Handler]\x1b[31m',
          error.message,
          '\x1b[37m'
        )
        throw new ClientException(40406)
      })
    )
    if (!place) {
      throw new ClientException(40406)
    }

    place.favorite =
      userId && (await this.favoritesService.isFavorite(userId, id))

    return place as Place
  }

  async getContent(
    userId: MongooSchema.Types.ObjectId,
    filter: PlaceFilterInput
  ) {
    const places = await this.renewManyPlacesPhotos(
      await this.placeModel.find({})
    )
    const placesFiltered = await this.filterPlaces(userId, places, filter)
    const favorites = userId ? await this.favoritesService.findAll(userId) : []
    placesFiltered.forEach((place) => {
      const isFavorite = !!favorites.find(
        (f) => f.id.toString() === place._id.toString()
      )
      place.favorite = isFavorite
    })
    return placesFiltered
  }

  watchPlaces() {
    const res = this.pubSub.asyncIterator('placeChanged')
    return res
  }

  findAll() {
    return `This action returns all place`
  }

  findOne(id: number) {
    return `This action returns a #${id} place`
  }

  async edit(
    userId: MongooSchema.Types.ObjectId,
    editPlaceInput: EditPlaceInput
  ) {
    const { id } = editPlaceInput
    const place = await this.placeModel.findById(id)
    if (!place) {
      throw new ClientException(40406)
    }
    if (place.userId.toString() !== userId.toString()) {
      throw new ClientException(40309)
    }

    const uploads = []
    const downloads = []
    for (const p in editPlaceInput.photos) {
      const photo = await this.trackService.uploadPhoto(
        editPlaceInput.photos[p]
      )
      if (photo) {
        uploads.push(photo.upload)
        downloads.push(photo.download)
      }
    }

    Promise.allSettled(downloads).then(async () => {
      const place = await this.placeModel.findByIdAndUpdate(
        id,
        editPlaceInput,
        { new: true }
      )

      const profile = await this.updateUserStatistics(userId)
      this.pubSub.publish('profileChanged', { watchProfile: profile })

      const emit: SubscriptionPlaceResponse = {
        function: 'UPDATE',
        id: place._id,
        data: place as Place,
        userId: place.userId
      }
      this.pubSub.publish('placeChanged', { watchPlaces: emit })
    })

    return uploads
  }

  async remove(
    userId: MongooSchema.Types.ObjectId,
    deletePlaceInput: DeletePlaceInput
  ) {
    const { id } = deletePlaceInput
    const place = await this.placeModel.findById(id)
    if (!place) {
      throw new ClientException(40406)
    }

    if (place.userId.toString() !== userId.toString()) {
      throw new ClientException(40308)
    }

    await this.placeModel.findByIdAndDelete(id)

    await this.favoritesService.remove(userId, { id: id.toString() })

    const profile = await this.updateUserStatistics(userId)
    this.pubSub.publish('profileChanged', { watchProfile: profile })

    const emit: SubscriptionPlaceResponse = {
      function: 'DELETE',
      id: place._id,
      userId: place.userId
    }
    this.pubSub.publish('placeChanged', { watchPlaces: emit })

    return `Успешно удален маршрут № ${id} `
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
        points: 0
      }
    }

    const places = await this.placeModel.find({ userId })

    user.statistics.places = places.length
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

  async getAdminStatistics() {
    return await this.placeModel.countDocuments()
  }

  async filterPlaces(
    currentId: MongooSchema.Types.ObjectId,
    places: Place[],
    filter: PlaceFilterInput
  ) {
    function isFilterFails(filter: string[] | null, value: string) {
      const isFilterEmpty =
        !filter ||
        (Array.isArray(filter) &&
          (filter.length == 0 || filter.includes(undefined)))
      return (
        !isFilterEmpty && !(Array.isArray(filter) && filter.includes(value))
      )
    }

    function isUserIdFails(
      userId: MongooSchema.Types.ObjectId | null,
      value: MongooSchema.Types.ObjectId
    ) {
      const isUserIdEmpty = !userId
      return !isUserIdEmpty && userId?.toString() !== value?.toString()
    }

    const { id, type, userId, similar, max } = filter || {}

    if (id) {
      const place = await this.getPlace(currentId, { id })
      return [place]
    }

    let placesSimilar: Place[]
    if (similar) {
      const reference = await this.placeModel.findById(similar)
      placesSimilar = places
        .sort((a: Place, b: Place) => {
          return (
            this.calcDistanceL2(reference, a) -
            this.calcDistanceL2(reference, b)
          )
        })
        .filter((place: Place) => {
          return place._id.toString() !== similar.toString()
        })
    } else {
      placesSimilar = places
    }

    const placesFiltered = placesSimilar.filter((place) => {
      if (isUserIdFails(userId, place.userId)) return false
      else if (isFilterFails([type], place.type)) return false
      else return true
    })

    return placesFiltered.slice(
      0,
      max && max < placesFiltered.length ? max : placesFiltered.length
    )
  }

  calcDistanceL2(sourcePlace: Place, targetPlace: Place) {
    const distance =
      (sourcePlace.lat - targetPlace.lat) ** 2 +
      (sourcePlace.lon - targetPlace.lon) ** 2

    return distance
  }

  async renewManyPlacesPhotos(
    places: (Document<unknown, object, PlaceDocument> &
      Place &
      Document<any, any, any> & { _id: Types.ObjectId })[]
  ) {
    const renews = []
    const res = []
    for (const place of places) {
      renews.push(
        this.renewOnePlacePhotos(place).then((place) => {
          res.push(place)
        })
      )
    }

    await Promise.allSettled(renews)
    return res
  }

  async renewOnePlacePhotos(
    place: Document<unknown, object, PlaceDocument> &
      Place &
      Document<any, any, any> & { _id: Types.ObjectId }
  ) {
    if (!place) {
      throw new ClientException(40406)
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
