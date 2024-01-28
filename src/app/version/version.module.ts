import { Module } from '@nestjs/common'
import { VersionService } from './version.service'
import { VersionResolver } from './version.resolver'
import { Version, VersionSchema } from './entities/version.entity'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  providers: [VersionResolver, VersionService],
  imports: [
    MongooseModule.forFeature([{ name: Version.name, schema: VersionSchema }])
  ]
})
export class VersionModule {}
