import { Version } from '../entities/version.entity'
import { InputType, OmitType } from '@nestjs/graphql'

@InputType({
  description: 'Входящая информация для установки версий приложений'
})
export class SetVersionInput extends OmitType(
  Version,
  ['backend'],
  InputType
) {}
