import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Schema as MongooSchema, Model } from 'mongoose'
import {
  Notification,
  NotificationDocument
} from './entities/notification.entity'
import { NotificationFilterInput } from './dto/notification-filter.input'
import { CreateNotificationInput } from './dto/create-notification.input'

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>
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
}
