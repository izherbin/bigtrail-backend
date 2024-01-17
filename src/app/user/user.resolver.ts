import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql'
import { SetNameInput } from './dto/set-name.input'
import { UserService } from './user.service'
import { Phone } from '../auth/phone.decorator'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { GetUserResponce } from './dto/get-user.response'
import { UploadedObjectInfo } from '../minio-client/dto/upload-file.dto'
import { GraphQLUpload } from 'graphql-upload'
import { FileUpload } from '../minio-client/file.model'
import { MinioClientService } from '../minio-client/minio-client.service'
import { PubSub } from 'graphql-subscriptions'

const pubSub = new PubSub()
@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly minioClientService: MinioClientService
  ) {}

  @Query(() => GetUserResponce, {
    description: 'Получить профайл пользователя'
  })
  @UseGuards(JwtAuthGuard)
  getProfile(@Phone() phone: string) {
    return this.userService.getProfile(phone)
  }

  @Subscription(() => GetUserResponce, {
    description: 'Следить за профайлом пользователя',
    filter: (payload, variables, context): boolean => {
      const ctx = context.req.extra.request
      const res = payload.watchProfile.phone === ctx.user.phone
      console.log('My phone:', ctx.user.phone)
      console.log('Changed phone:', payload.watchProfile.phone)
      return res
    }
  })
  @UseGuards(JwtAuthGuard)
  watchProfile(@Phone() phone: string) {
    console.log('phone:', phone)
    const res = pubSub.asyncIterator('profileChanged')
    return res
  }

  @Mutation(() => GetUserResponce, {
    description: 'Установить имя пользователя'
  })
  @UseGuards(JwtAuthGuard)
  async setName(
    @Phone() phone: string,
    @Args('setnameInput') setNameInput: SetNameInput
  ) {
    const profile = await this.userService.setName(phone, setNameInput)
    pubSub.publish('profileChanged', { watchProfile: profile })
    return profile
  }

  @Mutation(() => UploadedObjectInfo, {
    name: 'setProfileAvatar',
    description: 'Загрузить файл на сервер Minio'
  })
  @UseGuards(JwtAuthGuard)
  setProfileAvatar(
    @Phone() phone: string,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename }: FileUpload
  ) {
    return this.userService.setProfileAvatar(phone, createReadStream, filename)
  }

  @Mutation(() => String, {
    description: 'Удалить профайл пользователя'
  })
  @UseGuards(JwtAuthGuard)
  deleteProfile(@Phone() phone: string) {
    return this.userService.deleteUser(phone)
  }
}
