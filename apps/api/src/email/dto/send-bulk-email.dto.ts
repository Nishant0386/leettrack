// apps/api/src/email/dto/send-bulk-email.dto.ts
import { IsString, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class Recipient {
  @IsString()
  email: string;

  @IsString()
  name: string;
}

export class SendBulkEmailDto {
  @ApiProperty({ type: [Recipient] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => Recipient)
  recipients: Recipient[];

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  content: string;
}
