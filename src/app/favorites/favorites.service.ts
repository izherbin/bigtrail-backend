import { Inject, Injectable } from '@nestjs/common'
import { AddFavoriteInput } from './dto/add-favorite.input'
import { DeleteFavoriteInput } from './dto/delete-favorite.input'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from '../user/entities/user.entity'
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
    const { id } = addFavoriteInput

    const user = await this.userModel.findById(userId)

    if (user.favorites && user.favorites.find((f) => f.toString() === id)) {
      return `Content #${id} is already in favorites`
    }
    user.favorites.push(new Types.ObjectId(id))
    await user.save()

    const emit: SubscriptionFavoriteResponse = {
      function: 'ADD',
      id,
      userId: userId
    }
    this.pubSub.publish('favoriteChanged', { watchFavorites: emit })

    return `Content #${id} was successfully added to favorites`
  }

  async findAll(userId: MongooSchema.Types.ObjectId) {
    const user = await this.userModel.findById(userId)
    const res = user.favorites.map((f) => f.toString())
    return res
  }

  watchFavorites() {
    const res = this.pubSub.asyncIterator('favoriteChanged')
    return res
  }

  async remove(
    userId: MongooSchema.Types.ObjectId,
    deleteFavoriteInput: DeleteFavoriteInput
  ) {
    const user = await this.userModel.findById(userId)

    const { id } = deleteFavoriteInput
    const idx = user.favorites.findIndex((f) => f.toString() === id)
    if (idx < 0) {
      return `No such content #${id} in favorites`
    } else {
      user.favorites.splice(idx, 1)

      await user.save()

      const emit: SubscriptionFavoriteResponse = {
        function: 'DELETE',
        id,
        userId: userId
      }
      this.pubSub.publish('favoriteChanged', { watchFavorites: emit })

      return `Content #${id} was successfully deleted from favorites`
    }
  }
}
