import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { VersionService } from './version.service'
import { Version } from './entities/version.entity'
import { SetVersionInput } from './dto/set-version.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'

@Resolver()
export class VersionResolver {
  constructor(private readonly versionService: VersionService) {}

  @Mutation(() => Version)
  @UseGuards(JwtAuthGuard)
  setVersion(@Args('setVersionInput') setVersionInput: SetVersionInput) {
    return this.versionService.setVersion(setVersionInput)
  }

  @Query(() => Version)
  getVersion() {
    return this.versionService.getVersion()
  }
}
