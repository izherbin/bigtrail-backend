import { Field, ObjectType, PickType } from '@nestjs/graphql'
import { User } from 'src/app/user/entities/user.entity'

@ObjectType({
  description: 'Объект ответа после запроса своего профайла с телефоном'
})
export class GetProfileResponse extends PickType(User, [
  '_id',
  'phone',
  'ip',
  'tsCreated',
  'name',
  'status',
  'statistics'
]) {
  @Field(() => String, {
    nullable: true,
    description: 'Аватар пользователя (временная download-ссылка на аватар )'
  })
  avatar?: string
}
