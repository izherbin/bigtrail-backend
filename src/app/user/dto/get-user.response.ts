import { ObjectType, OmitType } from '@nestjs/graphql'
import { GetProfileResponse } from './get-profile.response'

@ObjectType({
  description: 'Объект ответа после запроса чужого профайла без телефона'
})
export class GetUserResponse extends OmitType(GetProfileResponse, ['phone']) {}
