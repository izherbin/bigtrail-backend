import { AppLinks } from '../entities/app-links.entity'
import { InputType, PickType } from '@nestjs/graphql'

@InputType({
  description: 'Входящая информация для установки ссылок на приложения'
})
export class SetAppLinksInput extends PickType(
  AppLinks,
  ['ruStore', 'appStore', 'googlePlay', 'site'],
  InputType
) {}
