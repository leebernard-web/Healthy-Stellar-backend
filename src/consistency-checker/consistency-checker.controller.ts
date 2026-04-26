import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConsistencyCheckerService, ConsistencyReport } from './consistency-checker.service';

@ApiTags('consistency-checker')
@Controller('consistency-checker')
export class ConsistencyCheckerController {
  constructor(private readonly checker: ConsistencyCheckerService) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually trigger a consistency check' })
  @ApiResponse({ status: 200, description: 'Consistency report' })
  async run(): Promise<ConsistencyReport> {
    return this.checker.runFullCheck();
  }

  @Get('health')
  @ApiOperation({ summary: 'Quick consistency health probe' })
  async health(): Promise<{ healthy: boolean; checkedAt: Date }> {
    const report = await this.checker.runFullCheck();
    return { healthy: report.healthy, checkedAt: report.checkedAt };
  }
}
