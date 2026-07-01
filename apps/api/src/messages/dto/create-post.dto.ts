// apps/api/src/messages/dto/create-post.dto.ts
import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'Anyone solved the two-pointer problem from today?' })
  @IsString()
  @MaxLength(5000)
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @ApiPropertyOptional({ example: 'def two_sum(nums, target): ...' })
  @IsOptional()
  @IsString()
  codeSnippet?: string;
}
