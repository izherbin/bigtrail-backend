import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Schema as MongooSchema, Model } from 'mongoose'
import {
  Notification,
  NotificationDocument
} from './entities/notification.entity'
import { NotificationFilterInput } from './dto/notification-filter.input'
import { CreateNotificationInput } from './dto/create-notification.input'
import { ClientErrors, ClientException } from '../client.exception'
import { SetNotificationViewedInput } from './dto/mark-notification.input'
import { PubSubEngine } from 'graphql-subscriptions'
import { UserService } from '../user/user.service'
import { GetProfileResponse } from '../user/dto/get-profile.response'
import { SubscriptionNotificationResponse } from './dto/subscription-notification.response'

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly userService: UserService,
    @Inject('PUB_SUB') private pubSub: PubSubEngine
  ) {}

  async create(createNotificationInput: CreateNotificationInput) {
    const notification = new this.notificationModel(createNotificationInput)
    notification.tsCreated = Date.now()

    const profile = await this.updateUserStatistics(notification.userId)
    if (!profile) {
      console.error(
        '\x1b[31m[Notification] - \x1b[37m',
        new Date().toLocaleString('en-EN'),
        '\x1b[33mWARNING',
        `Trying to send notificattion to non-existing user: ${notification.userId}`,
        '\x1b[37m'
      )
      return null
    }

    const res = await notification.save()

    console.log(
      'create Notification: notification.userId:',
      notification.userId
    )
    this.pubSub.publish('profileChanged', { watchProfile: profile })

    const emit: SubscriptionNotificationResponse = {
      function: 'ADD',
      id: res._id,
      data: res as Notification,
      userId: res.userId
    }
    this.pubSub.publish('notificationsChanged', { watchNotifications: emit })

    return notification
  }

  async getNotifications(
    userId: MongooSchema.Types.ObjectId,
    filter: NotificationFilterInput
  ) {
    const notifications = await this.notificationModel.find({ userId })

    const notificationsFiltered = await this.filterNotifications(
      notifications,
      filter
    )

    const nottificationsSorted = notificationsFiltered.sort((a, b) => {
      return b.tsCreated - a.tsCreated
    })

    return nottificationsSorted
  }

  async filterNotifications(
    notifications: Notification[],
    filter: NotificationFilterInput
  ) {
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

    const { ids, viewed, from, to } = filter || {}

    if (ids && Array.isArray(ids) && ids.length > 0) {
      const notificationsFiltered = notifications.filter((notification) => {
        let isFit = false
        ids.forEach((id) => {
          if (notification._id.toString() === id.toString()) {
            isFit = true
          }
        })
        return isFit
      })
      return notificationsFiltered
    }

    const notificationsFiltered = notifications.filter((notification) => {
      if (isBooleanFilterFails(viewed, notification.viewed)) return false
      else return true
    })

    const start = from && from > 0 ? from : 0
    const end =
      to && to < notificationsFiltered.length
        ? to
        : notificationsFiltered.length
    return notificationsFiltered.slice(start, end)
  }

  watchUserNotifications() {
    const res = this.pubSub.asyncIterator('notificationsChanged')
    return res
  }

  async markAsReadNotification(
    userId: MongooSchema.Types.ObjectId,
    setNotificationAsViewedInput: SetNotificationViewedInput
  ): Promise<string> {
    if (setNotificationAsViewedInput?.id) {
      const { id } = setNotificationAsViewedInput
      const notification = await this.notificationModel.findById(id)
      if (!notification) {
        throw new ClientException(ClientErrors['No such notification'])
      }

      if (notification.userId.toString() !== userId.toString()) {
        throw new ClientException(
          ClientErrors['Impossible to mark someone else`s notification as read']
        )
      }

      notification.viewed = true
      await notification.save()

      return `Уведомление ${id} отмечено как прочитанное`
    } else {
      const notifications = await this.notificationModel.find({ userId })
      notifications.forEach(async (notification) => {
        notification.viewed = true
        await notification.save()

        const emit: SubscriptionNotificationResponse = {
          function: 'UPDATE',
          id: notification._id,
          data: notification as Notification,
          userId: notification.userId
        }
        this.pubSub.publish('notificationsChanged', {
          watchNotifications: emit
        })
      })

      const profile = await this.updateUserStatistics(userId)
      this.pubSub.publish('profileChanged', { watchProfile: profile })

      return 'Все уведомления отмечены как прочитанные'
    }
  }

  async updateUserStatistics(userId: MongooSchema.Types.ObjectId) {
    const user = await this.userService.searchUserById(userId)
    if (!user) return null

    if (!user.statistics) {
      user.statistics = {
        subscribers: 0,
        subscriptions: 0,
        places: 0,
        routes: 0,
        tracks: 0,
        duration: 0,
        distance: 0,
        points: 0,
        notificationsUnread: 0
      }
    }

    const unread = await this.notificationModel.countDocuments({
      userId,
      viewed: false
    })

    user.statistics.notificationsUnread = unread

    await user.save()
    return user as GetProfileResponse
  }
}
