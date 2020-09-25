import { Controller, Req, SetMetadata, UseGuards, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Request } from 'express';
import { ROLES } from 'src/constants';
import { JwtAuthGuard } from './../AuthModule/jwt-auth.guard';
import { RolesGuard } from './../Helpers/CustomGaurds/roles.guard';

@ApiBearerAuth()
@Controller('/api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('/')
  @SetMetadata('roles', [ROLES.STUDENT, ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllNotifications(@Req() request: Request): Promise<any> {
    const user = request.user;
    return this.notificationsService.getAllNotifications(user);
  }
}
