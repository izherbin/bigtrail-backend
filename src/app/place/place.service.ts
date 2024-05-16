import { Inject, Injectable } from '@nestjs/common'
import { CreatePlaceInput } from './dto/create-place.input'
// import { UpdatePlaceInput } from './dto/update-place.input'
import { InjectModel } from '@nestjs/mongoose'
import { Place, PlaceDocument } from './entities/place.entity'
import { MinioClientService } from '../minio-client/minio-client.service'
import { Document, Model, Schema as MongooSchema, Types } from 'mongoose'
import { TrackService } from '../track/track.service'
import { GetPlaceInput } from './dto/get-place.input'
import { ClientErrors, ClientException } from '../client.exception'
import { DeletePlaceInput } from './dto/delete-place.input'
import { PlaceFilterInput } from './dto/place-filter.input'
import { PubSubEngine } from 'graphql-subscriptions'
import { SubscriptionPlaceResponse } from './dto/subscription-place.response'
import { UserService } from '../user/user.service'
import { GetProfileResponse } from '../user/dto/get-profile.response'
import { ConfigService } from '@nestjs/config'
import { FavoritesService } from '../favorites/favorites.service'
import { EditPlaceInput } from './dto/edit-place.input'
import { SetModeratedPlaceInput } from './dto/set-moderated-place.input'
import { SetVerifiedPlaceInput } from './dto/set-verified-place.input'
import { DeleteContentInput } from '../admin/dto/delete-content.input'
import { CreateReviewInput } from '../review/dto/create-review.input'
import { Review } from '../review/entities/review.entity'
import { UploadPhoto } from '../track/dto/upload-photo.response'
import { DeleteReviewInput } from '../review/dto/delete-review.input'
import { GetReviewsInput } from '../review/dto/get-reviews.input'
import { NotificationService } from '../notification/notification.service'
import { SubscriptionReviewResponse } from '../review/dto/subscription-review.response'

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
    private readonly notificationService: NotificationService,
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
      createPlace.timestamp = Date.now() //TODO Delete this if timestamp is not needed
      createPlace.tsCreated = new Date().getTime()

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

  async addReview(
    pubSubReview: PubSubEngine,
    userId: Types.ObjectId,
    createReviewInput: CreateReviewInput
  ): Promise<UploadPhoto[]> {
    const { contentId: placeId, ...payload } = createReviewInput
    const review = payload as Review
    review.userId = userId
    review.tsCreated = Date.now()

    const place = await this.renewOnePlacePhotos(
      await this.placeModel.findById(placeId)
    )
    if (!place) {
      throw new ClientException(ClientErrors['No such place'])
    }

    if (place.userId.toString() === userId.toString()) {
      throw new ClientException(
        ClientErrors['Impossible to review user`s own place']
      )
    }

    const reviewIdx = place.reviews.findIndex(
      (r) => r.userId.toString() === userId.toString()
    )

    const uploads: UploadPhoto[] = []
    const downloads = [] as Promise<any>[]

    for (const p in review.photos) {
      const photo = await this.trackService.uploadPhoto(review.photos[p])
      if (photo) {
        uploads.push(photo.upload)
        downloads.push(photo.download)
      }
    }

    let isNewReview: boolean
    Promise.allSettled(downloads).then(async () => {
      if (reviewIdx >= 0) {
        place.reviews[reviewIdx] = review
        isNewReview = false
      } else {
        place.reviews.push(review)
        isNewReview = true
      }

      place.reviewsCount = place.reviews.length
      place.markModified('reviewsCount')
      const totalRating = place.reviews.reduce(
        (total, review) => total + review.rating,
        0
      )
      place.rating =
        Math.round(
          (place.reviews.length ? totalRating / place.reviews.length : 0) * 10
        ) / 10
      place.markModified('rating')
      place.markModified('reviews')
      await place.save()

      const emit: SubscriptionPlaceResponse = {
        function: 'UPDATE',
        id: place._id,
        data: place as Place,
        userId: place.userId
      }
      this.pubSub.publish('placeChanged', { watchPlaces: emit })

      const emitReview: SubscriptionReviewResponse = {
        function: isNewReview ? 'ADD' : 'UPDATE',
        type: 'place',
        contentId: place._id,
        userId: userId as unknown as MongooSchema.Types.ObjectId,
        data: review
      }
      pubSubReview.publish('reviewChanged', { watchReviews: emitReview })
    })

    return uploads
  }

  async deleteReview(
    pubSubReview: PubSubEngine,
    userId: MongooSchema.Types.ObjectId,
    deleteReviewInput: DeleteReviewInput
  ) {
    const { contentId: id } = deleteReviewInput
    const place = await this.placeModel.findById(id)

    if (!place) {
      throw new ClientException(ClientErrors['No such place'])
    }

    if (userId.toString() === place.userId.toString()) {
      return 'Отсутствует ревью для удаления'
    }

    const reviewIdx = place.reviews.findIndex(
      (p) => p.userId.toString() === userId.toString()
    )

    if (reviewIdx >= 0) {
      place.reviews.splice(reviewIdx, 1)
      place.reviewsCount = place.reviews.length
      place.markModified('reviewsCount')
      const totalRating = place.reviews.reduce(
        (total, review) => total + review.rating,
        0
      )
      place.rating =
        Math.round(
          (place.reviews.length ? totalRating / place.reviews.length : 0) * 10
        ) / 10
      place.markModified('rating')
      place.markModified('reviews')
      await place.save()

      const emit: SubscriptionPlaceResponse = {
        function: 'UPDATE',
        id: place._id,
        data: place as Place,
        userId: place.userId
      }
      this.pubSub.publish('placeChanged', { watchPlaces: emit })

      const emitReview: SubscriptionReviewResponse = {
        function: 'DELETE',
        type: 'place',
        contentId: place._id,
        userId: userId as unknown as MongooSchema.Types.ObjectId
      }
      pubSubReview.publish('reviewChanged', { watchReviews: emitReview })

      return 'Ревью успешно удалено'
    } else {
      return 'Отсутствует ревью для удаления'
    }
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
        throw new ClientException(ClientErrors['No such place'])
      })
    )
    if (!place) {
      throw new ClientException(ClientErrors['No such place'])
    }

    place.favorite =
      userId && (await this.favoritesService.isFavorite(userId, id))

    return place as Place
  }

  async getPlaces(
    userId: MongooSchema.Types.ObjectId,
    filter: PlaceFilterInput
  ) {
    const places = await this.renewManyPlacesPhotos(
      await this.placeModel.find({})
    )
    const placesFiltered = await this.filterPlaces(places, filter)
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

  async getReviews(getReviewsInput: GetReviewsInput) {
    const { contentId: id } = getReviewsInput

    const place = await this.renewOnePlacePhotos(
      await this.placeModel.findById(id)
    )
    if (!place) {
      throw new ClientException(ClientErrors['No such place'])
    }

    return place.reviews || []
  }

  async edit(
    userId: MongooSchema.Types.ObjectId,
    editPlaceInput: EditPlaceInput
  ) {
    const { id } = editPlaceInput
    const place = await this.placeModel.findById(id)
    if (!place) {
      throw new ClientException(ClientErrors['No such place'])
    }
    if (place.userId.toString() !== userId.toString()) {
      throw new ClientException(
        ClientErrors['Impossible to edit someone else`s place']
      )
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
        { $set: editPlaceInput },
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

  async setModerated(setModeratedPlaceInput: SetModeratedPlaceInput) {
    const { id, ...update } = setModeratedPlaceInput
    const place = await this.placeModel.findById(id)
    if (!place) {
      throw new ClientException(ClientErrors['No such place'])
    }

    if (place.moderated) {
      throw new ClientException(ClientErrors['This place is already moderated'])
    }

    place.moderated = true
    place.set(update)
    await place.save()

    await this.notificationService.create({
      type: 'place',
      contentId: place._id,
      userId: place.userId,
      title: 'Интересное место модерировано',
      text: `Интересное место ${place.name} модерировано`
    })

    const emit: SubscriptionPlaceResponse = {
      function: 'UPDATE',
      id: place._id,
      data: place as Place,
      userId: place.userId
    }
    this.pubSub.publish('placeChanged', { watchPlaces: emit })

    return `Интересное место ${id} успешно модерировано`
  }

  async setVerified(setVerifiedPlaceInput: SetVerifiedPlaceInput) {
    const { id, ...update } = setVerifiedPlaceInput
    const place = await this.placeModel.findById(id)
    if (!place) {
      throw new ClientException(ClientErrors['No such place'])
    }

    if (place.verified) {
      throw new ClientException(ClientErrors['This place is already verified'])
    }

    place.verified = true
    place.set(update)
    await place.save()

    await this.notificationService.create({
      type: 'place',
      contentId: place._id,
      userId: place.userId,
      title: 'Интересное место верифицировано',
      text: `Интересное место ${place.name} верифицировано`
    })

    const emit: SubscriptionPlaceResponse = {
      function: 'UPDATE',
      id: place._id,
      data: place as Place,
      userId: place.userId
    }
    this.pubSub.publish('placeChanged', { watchPlaces: emit })

    return `Интересное место ${id} успешно верифицировано`
  }

  async remove(
    userId: MongooSchema.Types.ObjectId,
    deletePlaceInput: DeletePlaceInput
  ) {
    const { id } = deletePlaceInput
    const place = await this.placeModel.findById(id)
    if (!place) {
      throw new ClientException(ClientErrors['No such place'])
    }

    if (place.userId.toString() !== userId.toString()) {
      throw new ClientException(
        ClientErrors['Impossible to delete someone else`s place']
      )
    }

    place.moderated = false
    place.verified = false
    place.userId = await this.userService.getContentOwnerId()
    await place.save()

    // await this.favoritesService.remove(userId, { id: id.toString() })

    const profile = await this.updateUserStatistics(userId)
    this.pubSub.publish('profileChanged', { watchProfile: profile })

    const emit: SubscriptionPlaceResponse = {
      function: 'DELETE',
      id: place._id,
      userId
    }
    this.pubSub.publish('placeChanged', { watchPlaces: emit })

    return `Успешно удалено интересное место ${id} `
  }

  async wipeout(deletePlaceInput: DeleteContentInput) {
    const { id } = deletePlaceInput
    const place = await this.placeModel.findById(id)
    if (!place) {
      throw new ClientException(ClientErrors['No such place'])
    }

    if (place.moderated || place.verified) {
      throw new ClientException(
        ClientErrors['Impossible to wipe out moderated or verified place']
      )
    }

    const userId = place.userId
    await this.placeModel.findByIdAndDelete(id)

    // await this.favoritesService.remove(userId, { id: id.toString() })

    const profile = await this.updateUserStatistics(userId)
    this.pubSub.publish('profileChanged', { watchProfile: profile })

    const emit: SubscriptionPlaceResponse = {
      function: 'DELETE',
      id: place._id,
      userId
    }
    this.pubSub.publish('placeChanged', { watchPlaces: emit })

    return `Успешно стерто интересное место ${id} `
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

  async filterPlaces(places: Place[], filter: PlaceFilterInput) {
    function isStringFilterFails(filter: string[] | null, value: string) {
      const isFilterEmpty =
        !filter ||
        (Array.isArray(filter) &&
          (filter.length == 0 || filter.includes(undefined)))
      return (
        !isFilterEmpty && !(Array.isArray(filter) && filter.includes(value))
      )
    }

    function isBooleanFilterFails(
      filter: boolean | null | undefined,
      value: boolean
    ) {
      if (filter === true) {
        return !value
      } else if (filter === false) {
        return value
      } else {
        return false
      }
    }

    function isUserIdFails(
      userId: MongooSchema.Types.ObjectId | null,
      value: MongooSchema.Types.ObjectId
    ) {
      const isUserIdEmpty = !userId
      return !isUserIdEmpty && userId?.toString() !== value?.toString()
    }

    const {
      ids,
      type,
      userId,
      sort,
      order = 'asc',
      similar,
      moderated,
      verified,
      from,
      to
    } = filter || {}

    if (ids && Array.isArray(ids) && ids.length > 0) {
      const placesFiltered = places.filter((place) => {
        return ids.includes(place._id.toString())
      })
      return placesFiltered
    }

    let placesSorted = places
    if (sort === 'similarity') {
      if (!similar) {
        throw new ClientException(ClientErrors['Similar id is not specified'])
      }
      placesSorted = await this.sortBySimilarity(places, similar, order)
    } else if (sort === 'date') {
      placesSorted = await this.sortByDate(places, order)
    } else if (sort === null || sort === undefined) {
      if (similar) {
        placesSorted = await this.sortBySimilarity(places, similar, order)
      } else {
        placesSorted = await this.sortByDate(places, order)
      }
    } else {
      throw new ClientException(ClientErrors['Illegal sorting method'])
    }

    const placesFiltered = placesSorted.filter((place) => {
      if (isUserIdFails(userId, place.userId)) return false
      else if (isStringFilterFails([type], place.type)) return false
      else if (isBooleanFilterFails(moderated, place.moderated)) return false
      else if (isBooleanFilterFails(verified, place.verified)) return false
      else return true
    })

    const start = from && from > 0 ? from : 0
    const end = to && to < placesFiltered.length ? to : placesFiltered.length
    return placesFiltered.slice(start, end)
  }

  async sortBySimilarity(
    places: Place[],
    similar: MongooSchema.Types.ObjectId,
    order: string
  ) {
    const reference = await this.placeModel.findById(similar)
    places.sort((a: Place, b: Place) => {
      return (
        this.calcDistanceL2(reference, a) - this.calcDistanceL2(reference, b)
      )
    })

    if (order === 'desc') {
      places.reverse()
    }

    return places
  }

  async sortByDate(places: Place[], order: string) {
    places.sort((a: Place, b: Place) => {
      return a.tsCreated - b.tsCreated
    })

    if (order === 'desc') {
      places.reverse()
    }

    return places
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
      throw new ClientException(ClientErrors['No such place'])
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

    for (const review of place?.reviews) {
      if (!review.photos) continue

      for (const photo of review?.photos) {
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
        place.markModified('photos')
        place.markModified('reviews')
        return place.save()
      } else {
        return place
      }
    })
  }
}
