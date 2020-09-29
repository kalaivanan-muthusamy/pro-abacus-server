/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { HttpException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { NotificationsModel } from './notifications.schema';
import * as moment from 'moment-timezone';
import { NotificationInterface } from './interface/NotificationInterface';
import { ROLES } from 'src/constants';
import { NOTIFICATION_AUDIENCES } from './../constants';
import { StudentsService } from './../Students/students.service';
import { Types } from 'mongoose';
import { TeachersService } from './../Teachers/teachers.service';
import { forwardRef } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel('notifications')
    private readonly notificationsModel: Model<NotificationsModel>,
    @Inject(forwardRef(() => StudentsService))
    private readonly studentsService: StudentsService,
    @Inject(forwardRef(() => TeachersService))
    private readonly teachersService: TeachersService,
  ) {}

  async createNotification(notificationDTO: NotificationInterface): Promise<any> {
    try {
      const newNotification = {
        senderRole: notificationDTO.senderRole,
        senderId: notificationDTO.senderId,
        audience: notificationDTO.audience,
        type: notificationDTO.type,
        isBatchNotification: notificationDTO.isBatchNotification,
        to: notificationDTO.to,
        toAll: notificationDTO.toAll,
        examType: notificationDTO.examType,
        examId: notificationDTO.examId,
        expiryAt: notificationDTO.expiryAt,
        notificationDate: moment.tz('Asia/Calcutta').toDate(),
        message: notificationDTO.message,
        batchRequestId: notificationDTO.batchRequestId,
      };
      const newNotificationResponse = await this.notificationsModel.create(newNotification);
      return newNotificationResponse;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async getAllNotifications(user: any): Promise<any> {
    let userDetails;
    if (user.role === ROLES.STUDENT) {
      userDetails = await this.studentsService.getStudentDetails({ studentId: Types.ObjectId(user.userId) });
    } else if (user.role === ROLES.TEACHER) {
      userDetails = await this.teachersService.getTeacherDetails({ teacherId: Types.ObjectId(user.userId) });
    }

    const filter: any = {
      isDeleted: false,
      expiryAt: { $gte: moment.tz('Asia/Calcutta').toDate() },
    };

    const audienceFilter = [NOTIFICATION_AUDIENCES.ALL];
    if (user.role === ROLES.STUDENT) audienceFilter.push(NOTIFICATION_AUDIENCES.STUDENTS);
    if (user.role === ROLES.TEACHER) audienceFilter.push(NOTIFICATION_AUDIENCES.TEACHERS);
    filter.audience = { $in: [...audienceFilter] };

    let toFilter = [];
    if (user.role === ROLES.STUDENT) {
      toFilter = [userDetails.batchId, userDetails._id];
    } else if (user.role === ROLES.TEACHER) {
      toFilter = [user.userId];
    }
    filter.to = { $in: [...toFilter] };

    console.log(filter);

    const individualNotifications = await this.notificationsModel.find(filter);
    const groupNotifications = await this.notificationsModel.find({
      audience: { $in: audienceFilter },
      toAll: true,
    });

    const allNotifications = [...individualNotifications, ...groupNotifications].sort((a, b) =>
      a.notificationDate.getTime() > b.notificationDate.getTime() ? -1 : 0,
    );

    return allNotifications;
  }

  async removeNotification(notificationData: any): Promise<any> {
    try {
      const filter: any = {};

      if (notificationData.batchRequestId) {
        filter.batchRequestId = Types.ObjectId(notificationData.batchRequestId);
      }

      if (notificationData.senderId) {
        filter.senderId = Types.ObjectId(notificationData.senderId);
      }

      const notificationDetails = await this.notificationsModel.findOne(filter);
      if (notificationDetails) notificationDetails.remove();
      return null;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }
}
