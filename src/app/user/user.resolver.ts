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

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly minioClientService: MinioClientService
  ) {}

  @Query(() => GetUserResponce, {
    name: 'getProfile',
    description: 'Получить профайл пользователя'
  })
  @UseGuards(JwtAuthGuard)
  getProfileQuery(@Phone() phone: string) {
    return this.userService.getProfileQuery(phone)
  }

  @Subscription(() => GetUserResponce, {
    description: 'Следить за профайлом пользователя',
    filter: (payload, variables, context): boolean => {
      const res = payload.getProfile.phone === context.req.user.phone
      console.log('My phone:', context.req.user.phone)
      console.log('Changed phone:', payload.getProfile.phone)
      return res
    }
  })
  @UseGuards(JwtAuthGuard)
  getProfile(@Phone() phone: string) {
    console.log('phone:', phone)
    const res = this.userService.getProfile()
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
    return profile
  }

  @Mutation(() => String, {
    description: 'Загрузить аватар пользователя'
  })
  @UseGuards(JwtAuthGuard)
  setProfileAvatar(@Phone() phone: string) {
    return this.userService.setProfileAvatar(phone)
  }

  @Mutation(() => GetUserResponce, {
    description: 'Удалить аватар пользователя'
  })
  @UseGuards(JwtAuthGuard)
  deleteProfileAvatar(@Phone() phone: string) {
    return this.userService.deleteProfileAvatar(phone)
  }

  @Mutation(() => UploadedObjectInfo, {
    name: 'setProfileAvatarByUpload',
    deprecationReason:
      'This mutation is based on multipart upload, use setProfileAvatar() instead',
    description: 'Загрузить файл на сервер Minio'
  })
  @UseGuards(JwtAuthGuard)
  setProfileAvatarByUpload(
    @Phone() phone: string,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename }: FileUpload
  ) {
    return this.userService.setProfileAvatarByUpload(
      phone,
      createReadStream,
      filename
    )
  }

  @Mutation(() => String, {
    description: 'Удалить профайл пользователя'
  })
  @UseGuards(JwtAuthGuard)
  deleteProfile(@Phone() phone: string) {
    return this.userService.deleteUser(phone)
  }
}
