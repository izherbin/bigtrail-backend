import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'
import { FavoritesService } from './favorites.service'
import { AddFavoriteInput } from './dto/add-favorite.input'
import { DeleteFavoriteInput } from './dto/delete-favorite.input'
import { UseGuards } from '@nestjs/common'
import { UserId } from '../auth/user-id.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { SubscriptionFavoriteResponse } from './dto/subscription-favorites.response'

@Resolver()
export class FavoritesResolver {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  addFavorite(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('addFavoriteInput') addFavoriteInput: AddFavoriteInput
  ) {
    return this.favoritesService.addFavorite(userId, addFavoriteInput)
  }

  @Query(() => [String])
  @UseGuards(JwtAuthGuard)
  getFavorites(@UserId() userId: MongooSchema.Types.ObjectId) {
    return this.favoritesService.findAll(userId)
  }

  @Subscription(() => SubscriptionFavoriteResponse, {
    description:
      'Следить за списком избранного контента заданного пользователя',
    filter: (payload, variables, context): boolean => {
      const userId = context.req.user._id

      const res = payload.watchFavorites.userId.toString() === userId
      console.log('Watch favorite: userId:', userId)
      console.log('Watch favorite: My userId:', context.req.user._id)
      console.log(
        'Watch favorite: Changed userId:',
        payload.watchFavorites.userId.toString()
      )
      return res
    }
  })
  @UseGuards(JwtAuthGuard)
  watchFavorites(@UserId() userId: MongooSchema.Types.ObjectId) {
    console.log('Watch favorite: Current userId:', userId)
    const res = this.favoritesService.watchFavorites()
    return res
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  deleteFavorite(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('deleteFavoriteInput') deleteFavoriteInput: DeleteFavoriteInput
  ) {
    return this.favoritesService.remove(userId, deleteFavoriteInput)
  }
}
