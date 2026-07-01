// apps/api/src/messages/dto/send-message.dto.ts
import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  receiverId: string;

  @ApiProperty({ example: 'Hi, could you clarify the assignment deadline?' })
  @IsString()
  @MaxLength(5000)
  content: string;
}
