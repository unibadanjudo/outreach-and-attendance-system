import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../auth/interfaces/user-session.interface';
import { QueryMembersDto } from './dto/query-members.dto';
import {
  MemberSummaryDto,
  PaginatedMembersDto,
} from './dto/member-response.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { UpdateBeltRankDto } from './dto/update-belt-rank.dto';
import { MemberActivityResponseDto } from '../attendance/dto/member-activity-response.dto';
import { Member } from './models/member.model';
import { MembersService } from './members.service';

@ApiTags('Members')
@ApiCookieAuth('uijudo.sid')
@UseGuards(AuthenticatedGuard, RolesGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @ApiOperation({
    summary: 'List members with optional search, filtering, and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of members',
    type: PaginatedMembersDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  findAll(@Query() query: QueryMembersDto): Promise<PaginatedMembersDto> {
    return this.membersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get member details by ID, Phone, or Matric' })
  @ApiParam({
    name: 'id',
    description: 'Member ID, Phone number, or Matric number',
    example: '08012345678',
  })
  @ApiResponse({ status: 200, description: 'Member profile found' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  findById(@Param('id') id: string): Promise<Member> {
    return this.membersService.findById(id);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get member profile and engagement summary' })
  @ApiParam({
    name: 'id',
    description: 'Member ID, Phone number, or Matric number',
    example: '08012345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Member summary with real attendance and activity status',
    type: MemberSummaryDto,
  })
  @ApiResponse({ status: 404, description: 'Member not found' })
  getMemberSummary(@Param('id') id: string): Promise<MemberSummaryDto> {
    return this.membersService.getMemberSummary(id);
  }

  @Get(':id/activity')
  @ApiOperation({
    summary:
      'Get detailed attendance analytics and inactivity status for a member',
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID, Phone number, or Matric number',
    example: '08012345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Member attendance activity metrics and status',
    type: MemberActivityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Member not found' })
  getMemberActivity(
    @Param('id') id: string,
  ): Promise<MemberActivityResponseDto> {
    return this.membersService.getMemberActivity(id);
  }

  @Patch(':id')
  @Roles(Role.COACH, Role.CAPTAIN, Role.ADMIN)
  @ApiOperation({
    summary: 'Update member profile information in Google Sheets 🔒',
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID, Phone number, or Matric number',
    example: '08012345678',
  })
  @ApiResponse({ status: 200, description: 'Member profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<Member> {
    return this.membersService.update(id, dto);
  }

  @Patch(':id/belt-rank')
  @Roles(Role.COACH, Role.CAPTAIN, Role.ADMIN)
  @ApiOperation({
    summary: 'Update member belt rank in Google Sheets 🔒',
  })
  @ApiParam({
    name: 'id',
    description: 'Member ID, Phone number, or Matric number',
    example: '08012345678',
  })
  @ApiResponse({ status: 200, description: 'Belt rank updated successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  updateBeltRank(
    @Param('id') id: string,
    @Body() dto: UpdateBeltRankDto,
  ): Promise<Member> {
    return this.membersService.updateBeltRank(id, dto.beltRank);
  }
}

