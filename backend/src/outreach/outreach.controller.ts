import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserSession } from '../auth/interfaces/user-session.interface';
import { OutreachService } from './services/outreach.service';
import { CreateOutreachDto } from './dto/create-outreach.dto';
import { UpdateOutreachDto } from './dto/update-outreach.dto';
import { QueryOutreachDto } from './dto/query-outreach.dto';
import { QueryOutreachQueueDto } from './dto/query-outreach-queue.dto';
import {
  MemberOutreachHistoryDto,
  PaginatedOutreachDto,
} from './dto/outreach-response.dto';
import { PaginatedOutreachQueueDto } from './dto/outreach-queue-response.dto';
import { Outreach } from './models/outreach.model';

@ApiTags('Outreach')
@ApiCookieAuth('uijudo.sid')
@Controller()
@UseGuards(AuthenticatedGuard)
export class OutreachController {
  constructor(private readonly outreachService: OutreachService) {}

  @Get('outreach')
  @ApiOperation({ summary: 'List outreach logs with filters & pagination 🔒' })
  @ApiResponse({ status: 200, description: 'Paginated outreach list' })
  findAll(@Query() query: QueryOutreachDto): Promise<PaginatedOutreachDto> {
    return this.outreachService.findAll(query);
  }

  @Get('outreach/queue')
  @ApiOperation({
    summary: 'Get prioritized member outreach follow-up queue 🔒',
  })
  @ApiResponse({
    status: 200,
    description: 'Prioritized outreach queue with recommended actions',
  })
  getQueue(
    @Query() query: QueryOutreachQueueDto,
  ): Promise<PaginatedOutreachQueueDto> {
    return this.outreachService.getQueue(query);
  }

  @Get('outreach/:id')
  @ApiOperation({ summary: 'Get an outreach log by ID 🔒' })
  @ApiResponse({ status: 200, description: 'Outreach record found' })
  @ApiResponse({ status: 404, description: 'Outreach record not found' })
  findById(@Param('id') id: string): Promise<Outreach> {
    return this.outreachService.findById(id);
  }

  @Post('outreach')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record member outreach contact 🔒' })
  @ApiResponse({ status: 201, description: 'Outreach recorded successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  create(
    @Body() dto: CreateOutreachDto,
    @CurrentUser() user: UserSession,
  ): Promise<Outreach> {
    return this.outreachService.create(dto, user.name || user.email);
  }

  @Patch('outreach/:id')
  @ApiOperation({ summary: 'Update an outreach record 🔒' })
  @ApiResponse({ status: 200, description: 'Outreach record updated' })
  @ApiResponse({ status: 404, description: 'Outreach record not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOutreachDto,
  ): Promise<Outreach> {
    return this.outreachService.update(id, dto);
  }

  @Get('members/:id/outreach')
  @ApiOperation({ summary: 'Get outreach history for a specific member 🔒' })
  @ApiResponse({ status: 200, description: 'Member outreach history' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  getMemberOutreach(
    @Param('id') id: string,
  ): Promise<MemberOutreachHistoryDto> {
    return this.outreachService.findByMemberId(id);
  }
}
