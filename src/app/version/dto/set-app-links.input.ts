import { AppLinks } from '../entities/app-links.entity'
import { InputType, OmitType } from '@nestjs/graphql'

@InputType({
  description: 'Входящая информация для установки ссылок на приложения'
})
export class SetAppLinksInput extends OmitType(
  AppLinks,
  [],
  // [
  //   'ruStore',
  //   'appStore',
  //   'googlePlay',
  //   'site',
  //   'telegram',
  //   'viber',
  //   'vk',
  //   'whatsapp'
  // ],
  InputType
) {}
