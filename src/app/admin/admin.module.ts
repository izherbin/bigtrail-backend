import { Module } from '@nestjs/common'
import { AdminService } from './admin.service'
import { AdminResolver } from './admin.resolver'
import { UserModule } from '../user/user.module'
import { TrackModule } from '../track/track.module'
import { RouteModule } from '../route/route.module'
import { PlaceModule } from '../place/place.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule, UserModule, TrackModule, RouteModule, PlaceModule],
  providers: [AdminResolver, AdminService]
})
export class AdminModule {}
