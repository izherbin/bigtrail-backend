import { Resolver, Query, Args, Mutation } from '@nestjs/graphql'
import { NotificationService } from './notification.service'
import { Notification } from './entities/notification.entity'
import { UserId } from '../auth/user-id.decorator'
import { Schema as MongooSchema } from 'mongoose'
import { NotificationFilterInput } from './dto/notification-filter.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { SetNotificationViewedInput } from './dto/mark-notification.input'

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
}
