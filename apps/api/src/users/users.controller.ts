// apps/api/src/users/users.controller.ts
import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all platform users (super admin only)' })
  list(@Query('role') role?: 'STUDENT' | 'TEACHER' | 'SUPER_ADMIN') {
    return this.usersService.listAll(role);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get platform-wide statistics' })
  stats() {
    return this.usersService.getPlatformStats();
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a user account' })
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Reactivate a user account' })
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }
}
