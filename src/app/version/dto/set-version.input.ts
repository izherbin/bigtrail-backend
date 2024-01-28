import { Version } from '../entities/version.entity'
import { InputType, OmitType } from '@nestjs/graphql'

@InputType()
export class SetVersionInput extends OmitType(
  Version,
  ['backend'],
  InputType
) {}
