import { Query, Resolver } from '@nestjs/graphql'
import { AdminService } from './admin.service'
import { StatisticsResponse } from './dto/statistics.response'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { RolesGuard } from '../auth/roles.guards'
import { RequiredRoles } from '../auth/required-roles.decorator'
import { Role } from '../user/entities/user.entity'

@Resolver()
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => StatisticsResponse, {
    description: 'Выдать общую статистику (администратор)'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  adminGetStatistics() {
    return this.adminService.getStatistics()
  }
}
