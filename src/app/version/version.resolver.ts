import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { VersionService } from './version.service'
import { Version } from './entities/version.entity'
import { SetVersionInput } from './dto/set-version.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { Phone } from '../auth/phone.decorator'
import { AppLinks } from './entities/app-links.entity'
import { SetAppLinksInput } from './dto/set-app-links.input'

@Resolver()
export class VersionResolver {
  constructor(private readonly versionService: VersionService) {}

  @Mutation(() => Version, {
    description: 'Установить версии приложений'
  })
  @UseGuards(JwtAuthGuard)
  setVersion(
    @Phone() phone: string,
    @Args('setVersionInput') setVersionInput: SetVersionInput
  ) {
    return this.versionService.setVersion(phone, setVersionInput)
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
  @UseGuards(JwtAuthGuard)
  setAppLinks(
    @Phone() phone: string,
    @Args('setAppLinksInput') setAppLinksInput: SetAppLinksInput
  ) {
    return this.versionService.setAppLinks(phone, setAppLinksInput)
  }

  @Query(() => AppLinks, {
    description: 'Получить ссылки на приложения'
  })
  getAppLinks() {
    return this.versionService.getAppLinks()
  }
}
