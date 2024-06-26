import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AdminService } from './admin.service'
import { StatisticsResponse } from './dto/statistics.response'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { RolesGuard } from '../auth/roles.guards'
import { RequiredRoles } from '../auth/required-roles.decorator'
import { Role } from '../user/entities/user.entity'
import { LoginPasswordInput } from '../auth/dto/login-password.input'
import { AuthService } from '../auth/auth.service'
import { UserService } from '../user/user.service'
import { DeleteContentInput } from './dto/delete-content.input'
import { UploadPhoto } from '../track/dto/upload-photo.response'
import { EditRouteInput } from '../route/dto/edit-route.input'
import { RouteService } from '../route/route.service'
import { PlaceService } from '../place/place.service'
import { EditPlaceInput } from '../place/dto/edit-place.input'

@Resolver()
export class AdminResolver {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly routeService: RouteService,
    private readonly placeService: PlaceService
  ) {}

  @Query(() => StatisticsResponse, {
    description: 'Выдать общую статистику (администратор)'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  adminGetStatistics() {
    return this.adminService.getStatistics()
  }

  @Mutation(() => String, {
    name: 'adminAddModerator',
    description: 'Отправить данные для регистрации администратора'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  signupModerator(@Args('signupInput') signupInput: LoginPasswordInput) {
    return this.authService.signupModerator(signupInput)
  }

  @Mutation(() => String, {
    name: 'adminAddVerifier',
    description: 'Отправить данные для регистрации администратора'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  signupVerifier(@Args('signupInput') signupInput: LoginPasswordInput) {
    return this.authService.signupVerifier(signupInput)
  }

  @Mutation(() => String, {
    name: 'adminDeleteModerator',
    description: 'Удалить профайл модератора'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  deleteModerator(@Args('login') login: string) {
    return this.userService.deleteAdmin(login)
  }

  @Mutation(() => String, {
    name: 'adminDeleteVerifier',
    description: 'Удалить профайл верификатора'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  deleteVerifier(@Args('login') login: string) {
    return this.userService.deleteAdmin(login)
  }

  @Mutation(() => String, {
    name: 'adminDeleteContent',
    description: 'Стереть контент'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  deleteContent(
    @Args('deleteContentInput') deleteContentInput: DeleteContentInput
  ) {
    return this.adminService.deleteContent(deleteContentInput)
  }

  @Mutation(() => [UploadPhoto], {
    description: 'Редактировать маршрут (админ)'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  adminEditRoute(@Args('editRouteInput') editRouteInput: EditRouteInput) {
    return this.routeService.updateRoute(editRouteInput)
  }

  @Mutation(() => [UploadPhoto], {
    description: 'Редактировать место (админ)'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  adminEditPlace(@Args('editPlaceInput') editPlaceInput: EditPlaceInput) {
    return this.placeService.updatePlace(editPlaceInput)
  }
}
