import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateBeltRankDto {
  @ApiProperty({
    description: 'Judo belt rank (Kyu or Dan grade)',
    example: 'Black Belt (1st Dan - Shodan)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  beltRank!: string;
}
