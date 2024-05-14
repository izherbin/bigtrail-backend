import { InputType, OmitType } from '@nestjs/graphql'
import { Notification } from '../entities/notification.entity'

@InputType({ description: 'Информация для создания уведомления' })
export class CreateNotificationInput extends OmitType(Notification, [
  '_id',
  'tsCreated'
]) {}
