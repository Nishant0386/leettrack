// apps/api/src/auth/dto/connect-leetcode.dto.ts
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConnectLeetcodeDto {
  @ApiProperty({ example: 'john_doe_leetcode' })
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Username can only contain letters, numbers, underscores, hyphens' })
  username: string;
}
