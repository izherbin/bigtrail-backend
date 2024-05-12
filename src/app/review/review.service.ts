import { Injectable } from '@nestjs/common'
import { CreateReviewInput } from './dto/create-review.input'
import { UploadPhoto } from '../track/dto/upload-photo.response'
import { RouteService } from '../route/route.service'
import { PlaceService } from '../place/place.service'
import { Schema as MongoSchema } from 'mongoose'
import { ClientErrors, ClientException } from '../client.exception'
import { Types } from 'mongoose'
import { DeleteReviewInput } from './dto/delete-review.input'
import { GetReviewsInput } from './dto/get-reviews.input'

@Injectable()
export class ReviewService {
  constructor(
    private readonly routeService: RouteService,
    private readonly placeService: PlaceService
  ) {}

  async create(
    userId_: MongoSchema.Types.ObjectId,
    createReviewInput: CreateReviewInput
  ): Promise<UploadPhoto[]> {
    const { type } = createReviewInput

    const userId = new Types.ObjectId(userId_.toString())
    if (type === 'route') {
      return await this.routeService.addReview(userId, createReviewInput)
    } else if (type === 'place') {
      return await this.placeService.addReview(userId, createReviewInput)
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

  async getReviews(getReviewsInput: GetReviewsInput) {
    const { type } = getReviewsInput
    if (type === 'route') {
      return this.routeService.getReviews(getReviewsInput)
    } else if (type === 'place') {
      return this.placeService.getReviews(getReviewsInput)
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
      return this.routeService.deleteReview(userId, deleteReviewInput)
    } else if (type === 'place') {
      return this.placeService.deleteReview(userId, deleteReviewInput)
    } else {
      throw new ClientException(ClientErrors['Illegal content type'])
    }
  }
}
