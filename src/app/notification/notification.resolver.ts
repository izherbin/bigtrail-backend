import { Resolver, Query, Args, Mutation, Subscription } from '@nestjs/graphql'
import { NotificationService } from './notification.service'
import { Notification } from './entities/notification.entity'
import { UserId } from '../auth/user-id.decorator'
import { Schema as MongooSchema } from 'mongoose'
import { NotificationFilterInput } from './dto/notification-filter.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { SetNotificationViewedInput } from './dto/mark-notification.input'
import { SubscriptionNotificationResponse } from './dto/subscription-notification.response'

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Query(() => [Notification], {
    description:
      'Получить все уведомления текущего пользователя, удовлетворяющие фильтру'
  })
  @UseGuards(JwtAuthGuard)
  getNotifications(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('notificationFilterInput', { nullable: true })
    notificationFilterInput?: NotificationFilterInput
  ) {
    return this.notificationService.getNotifications(
      userId,
      notificationFilterInput
    )
  }

  @Mutation(() => String, {
    description: 'Отметить уведомление как прочитанное'
  })
  @UseGuards(JwtAuthGuard)
  markAsReadNotification(
    @UserId() userId: MongooSchema.Types.ObjectId,
    @Args('setNotificationAsViewedInput')
    setNotificationAsViewedInput: SetNotificationViewedInput
  ) {
    return this.notificationService.markAsReadNotification(
      userId,
      setNotificationAsViewedInput
    )
  }

  @Subscription(() => SubscriptionNotificationResponse, {
    description: 'Следить за всеми уведомлениями заданного пользователя',
    filter: (payload, variables, context): boolean => {
      const userId = context.req.user._id

      const res = payload.watchNotifications.userId.toString() === userId
      console.log('Watch notification: userId:', userId)
      console.log('Watch notification: My userId:', context.req.user._id)
      console.log(
        'Watch notification: Changed userId:',
        payload.watchNotifications.userId.toString()
      )
      return res
    }
  })
  @UseGuards(JwtAuthGuard)
  watchNotifications(@UserId() userId: MongooSchema.Types.ObjectId) {
    console.log('Watch notification: Input userId:', userId)
    const res = this.notificationService.watchUserNotifications()
    return res
  }
}
