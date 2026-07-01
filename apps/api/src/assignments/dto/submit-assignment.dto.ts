// apps/api/src/assignments/dto/submit-assignment.dto.ts
import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitAssignmentDto {
  @ApiPropertyOptional({ example: 'https://s3.amazonaws.com/leettrack/submission.pdf' })
  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @ApiPropertyOptional({ example: 'Solved all 5 problems, link to my submissions attached.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
