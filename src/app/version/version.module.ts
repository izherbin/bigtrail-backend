import { Module } from '@nestjs/common'
import { VersionService } from './version.service'
import { VersionResolver } from './version.resolver'
import { Version, VersionSchema } from './entities/version.entity'
import { MongooseModule } from '@nestjs/mongoose'
import { AppLinks, AppLinksSchema } from './entities/app-links.entity'

@Module({
  providers: [VersionResolver, VersionService],
  imports: [
    MongooseModule.forFeature([
      { name: Version.name, schema: VersionSchema },
      { name: AppLinks.name, schema: AppLinksSchema }
    ])
  ]
})
export class VersionModule {}
