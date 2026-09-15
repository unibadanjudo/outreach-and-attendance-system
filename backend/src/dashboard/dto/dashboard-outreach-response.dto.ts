import { ApiProperty } from '@nestjs/swagger';

export class DashboardOutreachDto {
  @ApiProperty({
    example: 25,
    description: 'Total outreach communications logged',
  })
  totalOutreach!: number;

  @ApiProperty({
    example: {
      WHATSAPP: 15,
      PHONE_CALL: 8,
      SMS: 2,
      EMAIL: 0,
      IN_PERSON: 0,
      OTHER: 0,
    },
    description: 'Breakdown of contacts by communication method',
  })
  contactMethodBreakdown!: Record<string, number>;

  @ApiProperty({
    example: {
      RESPONDED: 12,
      CONTACTED: 6,
      WILL_RETURN: 4,
      NO_RESPONSE: 2,
      PENDING: 1,
    },
    description: 'Breakdown of contacts by outcome status',
  })
  statusBreakdown!: Record<string, number>;

  @ApiProperty({
    example: 5,
    description: 'Scheduled follow-ups awaiting due date',
  })
  pendingFollowUps!: number;

  @ApiProperty({
    example: 2,
    description: 'Scheduled follow-ups that are currently due',
  })
  followUpsDue!: number;

  @ApiProperty({
    example: 6,
    description:
      'Members who attended training after receiving an outreach contact',
  })
  returnedAfterOutreach!: number;

  @ApiProperty({
    example: 40.0,
    description:
      'Percentage of contacted inactive members who returned to training',
  })
  returnRatePercentage!: number;
}
