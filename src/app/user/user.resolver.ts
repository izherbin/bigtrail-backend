import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql'
import { SetNameInput } from './dto/set-name.input'
import { UserService } from './user.service'
import { Phone } from '../auth/phone.decorator'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { GetProfileResponse } from './dto/get-profile.response'
import { UploadedObjectInfo } from '../minio-client/dto/upload-file.dto'
import { FileUpload } from '../minio-client/file.model'
import { uploadScalar } from '../minio-client/upload-scalar.util'
import { GetUserResponse } from './dto/get-user.response'
import { GetUserInput } from './dto/get-user.input'
import { SetStatusInput } from './dto/set-status.input'
import { RolesGuard } from '../auth/roles.guards'
import { RequiredRoles } from '../auth/required-roles.decorator'
import { Role } from './entities/user.entity'

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => GetProfileResponse, {
    name: 'getProfile',
    description: 'Получить профайл пользователя'
  })
  @UseGuards(JwtAuthGuard)
  getProfileQuery(@Phone() phone: string) {
    return this.userService.getProfileQuery(phone)
  }

  @Query(() => GetUserResponse, {
    description: 'Получить профайл другого пользователя'
  })
  getUser(@Args('getUserInput') getUserInput: GetUserInput) {
    return this.userService.getProfileById(getUserInput.id)
  }

  @Query(() => [GetProfileResponse], {
    description: 'Получить список пользователей (для админа)'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  adminGetUsersList() {
    return this.userService.getUsers()
  }

  @Subscription(() => GetProfileResponse, {
    description: 'Следить за профайлом пользователя',
    filter: (payload, variables, context) => {
      const id = payload.watchProfile._id.toString()
      const res = id === context.req.user._id
      console.log('Watch profile: My Id:', context.req.user._id)
      console.log('Watch profile: Changed Id:', id)
      return res
    }
  })
  @UseGuards(JwtAuthGuard)
  watchProfile(@Phone() phone: string) {
    console.log('Watch profile: phone:', phone)
    const res = this.userService.watchProfile()
    return res
  }

  @Mutation(() => GetProfileResponse, {
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

  @Mutation(() => GetProfileResponse, {
    description: 'Установить статус пользователя'
  })
  @UseGuards(JwtAuthGuard)
  async setProfileStatus(
    @Phone() phone: string,
    @Args('setStatusInput') setStatusInput: SetStatusInput
  ) {
    const profile = await this.userService.setProfleStatus(
      phone,
      setStatusInput
    )
    return profile
  }

  @Mutation(() => String, {
    description: 'Загрузить аватар пользователя'
  })
  @UseGuards(JwtAuthGuard)
  setProfileAvatar(@Phone() phone: string) {
    return this.userService.setProfileAvatar(phone)
  }

  @Mutation(() => GetProfileResponse, {
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
    @Args({ name: 'file', type: uploadScalar })
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

  @Mutation(() => String, {
    description: 'Удалить профайл администратора'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Superuser)
  deleteAdmin(@Args('login') login: string) {
    return this.userService.deleteAdmin(login)
  }
}
