import { Inject, Injectable } from '@nestjs/common'
import { CreateReviewInput } from './dto/create-review.input'
import { UploadPhoto } from '../track/dto/upload-photo.response'
import { RouteService } from '../route/route.service'
import { PlaceService } from '../place/place.service'
import { Schema as MongoSchema } from 'mongoose'
import { ClientErrors, ClientException } from '../client.exception'
import { Types } from 'mongoose'
import { DeleteReviewInput } from './dto/delete-review.input'
import { GetReviewsInput } from './dto/get-reviews.input'
import { Review } from './entities/review.entity'
import { ReviewFilterInput } from './dto/review-filter.input'
import { PubSubEngine } from 'graphql-subscriptions'

@Injectable()
export class ReviewService {
  constructor(
    private readonly routeService: RouteService,
    private readonly placeService: PlaceService,
    @Inject('PUB_SUB') private pubSub: PubSubEngine
  ) {}

  async create(
    userId_: MongoSchema.Types.ObjectId,
    createReviewInput: CreateReviewInput
  ): Promise<UploadPhoto[]> {
    const { type } = createReviewInput

    const userId = new Types.ObjectId(userId_.toString())
    if (type === 'route') {
      return await this.routeService.addReview(
        this.pubSub,
        userId,
        createReviewInput
      )
    } else if (type === 'place') {
      return await this.placeService.addReview(
        this.pubSub,
        userId,
        createReviewInput
      )
    } else {
      throw new ClientException(ClientErrors['Illegal content type'])
    }
  }

  findAll() {
    return `This action returns all review`
  }

  findOne(id: number) {
    return `This action returns a #${id} review`
  }

  async getReviews(
    getReviewsInput: GetReviewsInput,
    filter: ReviewFilterInput = {}
  ) {
    const { type } = getReviewsInput
    if (type === 'route') {
      return this.filterReviews(
        await this.routeService.getReviews(getReviewsInput),
        filter
      )
    } else if (type === 'place') {
      return this.filterReviews(
        await this.placeService.getReviews(getReviewsInput),
        filter
      )
    } else {
      throw new ClientException(ClientErrors['Illegal content type'])
    }
  }

  remove(
    userId: MongoSchema.Types.ObjectId,
    deleteReviewInput: DeleteReviewInput
  ) {
    const { type } = deleteReviewInput
    if (type === 'route') {
      return this.routeService.deleteReview(
        this.pubSub,
        userId,
        deleteReviewInput
      )
    } else if (type === 'place') {
      return this.placeService.deleteReview(
        this.pubSub,
        userId,
        deleteReviewInput
      )
    } else {
      throw new ClientException(ClientErrors['Illegal content type'])
    }
  }

  async filterReviews(reviews: Review[], filter: ReviewFilterInput) {
    if (!filter) return reviews
    const { userId, ratings, from, to } = filter

    if (userId) {
      const reviewsFiltered = reviews.filter((review) => {
        if (review.userId.toString() !== userId.toString()) return false
        else return true
      })
      return reviewsFiltered
    } else {
      let reviewsFiltered = reviews
      if (ratings) {
        reviewsFiltered = reviews.filter((review) => {
          const filterPassed = ratings.includes(review.rating || 0)
          return filterPassed
        })
      }

      const start = from > 0 ? from : 0
      const end = to < reviewsFiltered.length ? to : reviewsFiltered.length
      const reviewsPaginated = reviewsFiltered.slice(start, end)
      return reviewsPaginated
    }
  }

  watchReviews() {
    const iterator = this.pubSub.asyncIterator('reviewChanged')
    return iterator
  }
}
