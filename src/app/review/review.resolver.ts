import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'
import { ReviewService } from './review.service'
import { Review } from './entities/review.entity'
import { CreateReviewInput } from './dto/create-review.input'
import { UploadPhoto } from '../track/dto/upload-photo.response'
import { Schema as MongoSchema } from 'mongoose'
import { UserId } from '../auth/user-id.decorator'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { DeleteReviewInput } from './dto/delete-review.input'
import { GetReviewsInput } from './dto/get-reviews.input'

@Resolver(() => Review)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @Mutation(() => [UploadPhoto], { description: 'Создать ревью' })
  @UseGuards(JwtAuthGuard)
  createReview(
    @UserId() userId: MongoSchema.Types.ObjectId,
    @Args('createReviewInput') createReviewInput: CreateReviewInput
  ) {
    return this.reviewService.create(userId, createReviewInput)
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  deleteReview(
    @UserId() userId: MongoSchema.Types.ObjectId,
    @Args('deleteReviewInput') deleteReviewInput: DeleteReviewInput
  ) {
    return this.reviewService.remove(userId, deleteReviewInput)
  }

  @Query(() => [Review])
  getReviews(@Args('getReviewsInput') getReviewsInput: GetReviewsInput) {
    return this.reviewService.getReviews(getReviewsInput)
  }
}
