import { Resolver, Mutation, Args, Query, Subscription } from '@nestjs/graphql'
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
import { ReviewFilterInput } from './dto/review-filter.input'
import { SubscriptionReviewResponse } from './dto/subscription-review.response'

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

  @Query(() => [Review], { description: 'Получить ревью, ' })
  getReviews(
    @Args('getReviewsInput') getReviewsInput: GetReviewsInput,
    @Args('filter', { nullable: true }) filter: ReviewFilterInput
  ) {
    return this.reviewService.getReviews(getReviewsInput, filter)
  }

  @Subscription(() => SubscriptionReviewResponse, {
    description: 'Следить за всеми ревью единицы контента',
    filter: (payload, variables): boolean => {
      const { type, contentId } = variables.getReviewsInput
      const passedFilter =
        payload.watchReviews.type === type &&
        payload.watchReviews.contentId.toString() === contentId.toString()
      return passedFilter
    }
  })
  watchReviews(@Args('getReviewsInput') getReviewsInput: GetReviewsInput) {
    console.log('getReviewsInput:', getReviewsInput)
    return this.reviewService.watchReviews()
  }
}
