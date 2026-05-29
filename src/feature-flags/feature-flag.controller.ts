import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FeatureFlagService, UpsertFeatureFlagDto } from './feature-flag.service';

@ApiTags('feature-flags')
@ApiBearerAuth()
@Controller('admin/feature-flags')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class FeatureFlagController {
  constructor(private readonly service: FeatureFlagService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  upsert(@Body() dto: UpsertFeatureFlagDto, @Req() req: any) {
    return this.service.upsert(dto, req.user?.id ?? 'system');
  }

  @Patch(':key/rollback')
  rollback(@Param('key') key: string, @Req() req: any) {
    return this.service.rollback(key, req.user?.id ?? 'system');
  }
}
