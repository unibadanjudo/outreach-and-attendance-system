import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMemberDto {
  @ApiPropertyOptional({ example: 'Adewale', description: 'First name' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Oladipo', description: 'Last name' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  lastName?: string;

  @ApiPropertyOptional({ example: 'Olusegun', description: 'Other names' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  otherNames?: string;

  @ApiPropertyOptional({ example: 'Wale', description: 'Dojo nickname' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiPropertyOptional({ example: '08012345678', description: 'Phone / WhatsApp number' })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'Faculty of Education - Human Kinetics',
    description: 'Faculty / Department',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  facultyDepartment?: string;

  @ApiPropertyOptional({ example: '219482', description: 'Matriculation or student ID' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  matricNumber?: string;

  @ApiPropertyOptional({ example: '2001-05-14', description: 'Date of birth (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '2023-11-01', description: 'Date started judo (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  judoStartDate?: string;

  @ApiPropertyOptional({
    example: 'Self Defense and Competition',
    description: 'Primary motivation for training judo',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  motivation?: string;

  @ApiPropertyOptional({
    example: 'Joined after admission / Online group',
    description: 'How the member heard about Judo / the club',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  howDidYouHearAboutUs?: string;

  @ApiPropertyOptional({
    example: 'Black Belt (1st Dan - Shodan)',
    description: 'Judo belt rank (Kyu or Dan grade)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  beltRank?: string;
}
