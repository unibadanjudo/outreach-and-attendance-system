import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { DashboardService } from './dashboard.service';
import { QueryInactiveMembersDto } from './dto/query-inactive-members.dto';
import { PaginatedInactiveMembersDto } from './dto/inactive-members-response.dto';
import { DashboardSummaryDto } from './dto/dashboard-summary-response.dto';
import { DashboardAttendanceDto } from './dto/dashboard-attendance-response.dto';
import { DashboardOutreachDto } from './dto/dashboard-outreach-response.dto';
import { ConsolidatedDashboardDto } from './dto/consolidated-dashboard-response.dto';

@ApiTags('Dashboard')
@ApiCookieAuth('uijudo.sid')
@UseGuards(AuthenticatedGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary:
      'Get consolidated dashboard metrics (summary, attendance, inactiveMembers, outreach) 🔒',
  })
  @ApiResponse({
    status: 200,
    description: 'Consolidated dashboard metrics returned in a single request',
    type: ConsolidatedDashboardDto,
  })
  getDashboard(
    @Query() query: QueryInactiveMembersDto,
  ): Promise<ConsolidatedDashboardDto> {
    return this.dashboardService.getDashboard(query);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get consolidated executive overview metrics for the Judo club 🔒',
  })
  @ApiResponse({
    status: 200,
    description: 'Executive club KPIs, activity breakdown, and outreach stats',
    type: DashboardSummaryDto,
  })
  getSummary(): Promise<DashboardSummaryDto> {
    return this.dashboardService.getSummary();
  }

  @Get('attendance')
  @ApiOperation({
    summary:
      'Get training attendance breakdown, timelines, and session stats 🔒',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance statistics and session distribution',
    type: DashboardAttendanceDto,
  })
  getAttendanceMetrics(): Promise<DashboardAttendanceDto> {
    return this.dashboardService.getAttendanceMetrics();
  }

  @Get('outreach')
  @ApiOperation({
    summary:
      'Get outreach performance, contact channels, and member return rates 🔒',
  })
  @ApiResponse({
    status: 200,
    description: 'Outreach metrics and return conversion rates',
    type: DashboardOutreachDto,
  })
  getOutreachMetrics(): Promise<DashboardOutreachDto> {
    return this.dashboardService.getOutreachMetrics();
  }

  @Get('inactive-members')
  @ApiOperation({
    summary: 'List inactive members prioritized for retention outreach 🔒',
  })
  @ApiResponse({
    status: 200,
    description:
      'Paginated list of inactive members ranked by outreach relevance',
    type: PaginatedInactiveMembersDto,
  })
  getInactiveMembers(
    @Query() query: QueryInactiveMembersDto,
  ): Promise<PaginatedInactiveMembersDto> {
    return this.dashboardService.getInactiveMembers(query);
  }
}
