// apps/api/src/messages/dto/create-announcement.dto.ts
import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsString()
  classId: string;

  @ApiProperty({ example: 'Class Rescheduled' })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiProperty({ example: "Tomorrow's class moved to 6 PM due to a holiday." })
  @IsString()
  @MaxLength(3000)
  content: string;
}
