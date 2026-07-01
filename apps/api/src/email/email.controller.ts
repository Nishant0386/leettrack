// apps/api/src/email/email.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SendEmailDto } from './dto/send-email.dto';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';

@ApiTags('email')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TEACHER', 'SUPER_ADMIN')
@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a single/individual or class-wide email' })
  send(@Body() dto: SendEmailDto) {
    return this.emailService.sendEmail(dto.to, dto.subject, dto.content);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Send batch emails to multiple recipients' })
  sendBulk(@Body() dto: SendBulkEmailDto) {
    return this.emailService.sendBulkEmail(dto.recipients, dto.subject, dto.content);
  }
}
