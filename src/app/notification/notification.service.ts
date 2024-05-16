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

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @Inject('PUB_SUB') private pubSub: PubSubEngine
  ) {}
  async create(createNotificationInput: CreateNotificationInput) {
    const notification = new this.notificationModel(createNotificationInput)
    notification.tsCreated = Date.now()
    const res = await notification.save()
    return res
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

    return notificationsFiltered
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
    const res = this.pubSub.asyncIterator('notificationChanged')
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
      })

      return 'Все уведомления отмечены как прочитанные'
    }
  }
}
