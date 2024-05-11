import { Resolver, Mutation, Args, Int } from '@nestjs/graphql'
import { ReviewService } from './review.service'
import { Review } from './entities/review.entity'
import { CreateReviewInput } from './dto/create-review.input'
import { UploadPhoto } from '../track/dto/upload-photo.response'
import { Schema as MongoSchema } from 'mongoose'
import { UserId } from '../auth/user-id.decorator'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'

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

  @Mutation(() => Review)
  removeReview(@Args('id', { type: () => Int }) id: number) {
    return this.reviewService.remove(id)
  }
}
