import { Resolver, Query, Args } from '@nestjs/graphql'
import { NotificationService } from './notification.service'
import { Notification } from './entities/notification.entity'
import { UserId } from '../auth/user-id.decorator'
import { Schema as MongooSchema } from 'mongoose'
import { NotificationFilterInput } from './dto/notification-filter.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'

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
}
