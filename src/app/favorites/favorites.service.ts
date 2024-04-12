import { Inject, Injectable } from '@nestjs/common'
import { AddFavoriteInput } from './dto/add-favorite.input'
import { DeleteFavoriteInput } from './dto/delete-favorite.input'
import { InjectModel } from '@nestjs/mongoose'
import { Favorite, User, UserDocument } from '../user/entities/user.entity'
import { Model, Schema as MongooSchema, Types } from 'mongoose'
import { PubSubEngine } from 'graphql-subscriptions'
import { SubscriptionFavoriteResponse } from './dto/subscription-favorites.response'

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @Inject('PUB_SUB') private pubSub: PubSubEngine
  ) {}

  async addFavorite(
    userId: MongooSchema.Types.ObjectId,
    addFavoriteInput: AddFavoriteInput
  ) {
    const { id, type } = addFavoriteInput

    const user = await this.userModel.findById(userId)

    if (user.favorites && user.favorites.find((f) => f.id.toString() === id)) {
      return `Content #${id} is already in favorites`
    }

    const favorite: Favorite = {
      id: new Types.ObjectId(id),
      type
    }
    user.favorites.push(favorite)
    await user.save()

    const emit: SubscriptionFavoriteResponse = {
      function: 'ADD',
      data: favorite,
      userId: userId
    }
    this.pubSub.publish('favoriteChanged', { watchFavorites: emit })

    return `Content #${id} was successfully added to favorites`
  }

  async findAll(userId: MongooSchema.Types.ObjectId) {
    const user = await this.userModel.findById(userId)
    return user.favorites || []
  }

  watchFavorites() {
    const res = this.pubSub.asyncIterator('favoriteChanged')
    return res
  }

  async isFavorite(
    userId: MongooSchema.Types.ObjectId,
    id: string
  ): Promise<boolean> {
    const user = await this.userModel.findById(userId)
    if (!user.favorites) return false
    return !!user.favorites.find((f) => f.id.toString() === id)
  }

  async remove(
    userId: MongooSchema.Types.ObjectId,
    deleteFavoriteInput: DeleteFavoriteInput
  ) {
    const user = await this.userModel.findById(userId)

    const { id } = deleteFavoriteInput
    const idx = user.favorites.findIndex((f) => f.id.toString() === id)
    if (idx < 0) {
      return `No such content #${id} in favorites`
    } else {
      const favorite = user.favorites[idx]
      user.favorites.splice(idx, 1)
      await user.save()

      const emit: SubscriptionFavoriteResponse = {
        function: 'DELETE',
        data: favorite,
        userId: userId
      }
      this.pubSub.publish('favoriteChanged', { watchFavorites: emit })

      return `Content #${id} was successfully deleted from favorites`
    }
  }
}
