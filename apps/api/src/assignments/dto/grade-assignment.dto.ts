// apps/api/src/assignments/dto/grade-assignment.dto.ts
import { IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GradeAssignmentDto {
  @ApiProperty({ example: 85 })
  @IsInt()
  @Min(0)
  marksObtained: number;

  @ApiPropertyOptional({ example: 'Great work, but check edge cases for empty trees.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  feedback?: string;
}
