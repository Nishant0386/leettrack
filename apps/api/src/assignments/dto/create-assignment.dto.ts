// apps/api/src/assignments/dto/create-assignment.dto.ts
import { IsString, IsOptional, IsEnum, IsDateString, IsInt, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DifficultyLevel } from '@prisma/client';

export class CreateAssignmentDto {
  @ApiProperty()
  @IsString()
  classId: string;

  @ApiProperty({ example: 'Binary Trees Practice Set' })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiProperty({ example: 'Solve 5 medium-level binary tree problems on LeetCode.' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ enum: DifficultyLevel, default: DifficultyLevel.MEDIUM })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @ApiProperty({ example: '2026-07-15T23:59:00.000Z' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ default: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxMarks?: number;

  @ApiPropertyOptional()
  @IsOptional()
  resources?: Record<string, any>;
}
