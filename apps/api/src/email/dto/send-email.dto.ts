// apps/api/src/email/dto/send-email.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({ description: 'Single email or array of emails', example: ['student@example.com'] })
  to: string | string[];

  @ApiProperty({ example: 'Important Class Update' })
  @IsString()
  subject: string;

  @ApiProperty({ example: '<p>Class rescheduled to 5 PM today.</p>' })
  @IsString()
  content: string;
}
