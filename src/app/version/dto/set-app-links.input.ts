import { AppLinks } from '../entities/app-links.entity'
import { InputType } from '@nestjs/graphql'

@InputType({
  description: 'Входящая информация для установки версий приложений'
})
export class SetAppLinksInput extends AppLinks {}
