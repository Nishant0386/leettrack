// apps/api/src/classes/dto/join-class.dto.ts
import { IsString, IsOptional, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class JoinClassDto {
  @ApiPropertyOptional({ example: 'A1B2C3D4' })
  @ValidateIf((o) => !o.inviteLink)
  @IsString()
  joinCode?: string;

  @ApiPropertyOptional({ example: 'demo-invite-link-2024' })
  @ValidateIf((o) => !o.joinCode)
  @IsString()
  inviteLink?: string;
}
