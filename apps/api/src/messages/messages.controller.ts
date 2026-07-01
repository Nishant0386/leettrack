// apps/api/src/messages/messages.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SendMessageDto } from './dto/send-message.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  // ─── Direct Messages ──────────────────────────────

  @Post('messages')
  @ApiOperation({ summary: 'Send a direct message' })
  send(@CurrentUser() user: any, @Body() dto: SendMessageDto) {
    return this.messagesService.sendDirectMessage(user.id, dto);
  }

  @Get('messages/conversations')
  @ApiOperation({ summary: 'List all conversations for current user' })
  conversations(@CurrentUser() user: any) {
    return this.messagesService.getConversationsList(user.id);
  }

  @Get('messages/:otherUserId')
  @ApiOperation({ summary: 'Get conversation thread with another user' })
  conversation(@CurrentUser() user: any, @Param('otherUserId') otherUserId: string) {
    return this.messagesService.getConversation(user.id, otherUserId);
  }

  // ─── Discussion Channels ──────────────────────────

  @Post('discussions/channels')
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a discussion channel for a class' })
  createChannel(@Body() body: { classId: string; name: string; topic?: string }) {
    return this.messagesService.createChannel(body.classId, body.name, body.topic);
  }

  @Get('discussions/channels/:classId')
  @ApiOperation({ summary: 'List discussion channels for a class' })
  listChannels(@Param('classId') classId: string) {
    return this.messagesService.listChannels(classId);
  }

  @Post('discussions/:channelId/posts')
  @ApiOperation({ summary: 'Post in a discussion channel (student or teacher)' })
  createPost(@CurrentUser() user: any, @Param('channelId') channelId: string, @Body() dto: CreatePostDto) {
    return this.messagesService.createPost(channelId, user.id, dto);
  }

  @Get('discussions/:channelId/posts')
  @ApiOperation({ summary: 'Get posts in a discussion channel' })
  getPosts(@Param('channelId') channelId: string) {
    return this.messagesService.getPosts(channelId);
  }

  // ─── Announcements ─────────────────────────────────

  @Post('announcements')
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a class announcement' })
  createAnnouncement(@Body() dto: CreateAnnouncementDto) {
    return this.messagesService.createAnnouncement(dto.classId, dto.title, dto.content);
  }

  @Get('announcements/:classId')
  @ApiOperation({ summary: 'List announcements for a class' })
  listAnnouncements(@Param('classId') classId: string) {
    return this.messagesService.listAnnouncements(classId);
  }
}
