import { Module } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { NotificationResolver } from './notification.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import {
  Notification,
  NotificationSchema
} from './entities/notification.entity'
import { UserModule } from '../user/user.module'

@Module({
  providers: [NotificationResolver, NotificationService],
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema }
    ]),
    UserModule
  ],
  exports: [NotificationService]
})
export class NotificationModule {}
