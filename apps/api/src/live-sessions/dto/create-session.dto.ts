// apps/api/src/live-sessions/dto/create-session.dto.ts
import { IsString, IsOptional, IsDateString, IsInt, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty()
  @IsString()
  classId: string;

  @ApiProperty({ example: 'Live DSA Doubt-Solving Session' })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-07-05T15:00:00.000Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ example: 60, description: 'Duration in minutes' })
  @IsInt()
  @Min(15)
  @Max(240)
  duration: number;
}
