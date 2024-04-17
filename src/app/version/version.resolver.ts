import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { VersionService } from './version.service'
import { Version } from './entities/version.entity'
import { SetVersionInput } from './dto/set-version.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { AppLinks } from './entities/app-links.entity'
import { SetAppLinksInput } from './dto/set-app-links.input'
import { RolesGuard } from '../auth/roles.guards'
import { RequiredRoles } from '../auth/required-roles.decorator'
import { Role } from '../user/entities/user.entity'

@Resolver()
export class VersionResolver {
  constructor(private readonly versionService: VersionService) {}

  @Mutation(() => Version, {
    description: 'Установить версии приложений'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  setVersion(@Args('setVersionInput') setVersionInput: SetVersionInput) {
    return this.versionService.setVersion(setVersionInput)
  }

  @Query(() => Version, {
    description: 'Получить версии приложений'
  })
  getVersion() {
    return this.versionService.getVersion()
  }

  @Mutation(() => AppLinks, {
    description: 'Установить ссылки на приложения'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  setAppLinks(@Args('setAppLinksInput') setAppLinksInput: SetAppLinksInput) {
    return this.versionService.setAppLinks(setAppLinksInput)
  }

  @Query(() => AppLinks, {
    description: 'Получить ссылки на приложения'
  })
  getAppLinks() {
    return this.versionService.getAppLinks()
  }
}
