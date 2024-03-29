/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { forwardRef, HttpException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment-timezone';
import { BatchesModel, BatchRequestsModel } from './batches.schema';
import { NewBatchDTO } from './dto/NewBatchDTO';
import { TeachersService } from './../Teachers/teachers.service';
import { JoinBatchDTO } from './dto/JoinBatchDTO';
import { SearchBatchDTO } from './dto/SearchBatchDTO';
import { BATCH_REQUEST_STATUS, BATCH_REQUEST_TYPE } from './../constants';
import { NotificationsService } from './../Notifications/notifications.service';
import { ROLES } from 'src/constants';
import { NOTIFICATION_TYPES } from 'src/constants';
import { StudentsService } from './../Students/students.service';
import { AcceptBatchRequestDTO } from './dto/AcceptBatchRequestDTO';
import { NOTIFICATION_AUDIENCES } from './../constants';
import { ucFirst } from './../Helpers/Common/index';
import { UpdateBatchDTO } from './dto/UpdateBatchDTO';
import { InviteToBatchDTO } from './dto/InviteToBatchDTO';
import { DeleteStudentFromBatchDTO } from './dto/DeleteStudentFromBatchDTO';
import { DEFAULT_NOTIFICATION_EXPIRY_DAYS } from 'src/configs';
import { APP_TIMEZONE } from 'src/configs';

@Injectable()
export class BatchesService {
  constructor(
    @InjectModel('batches')
    private readonly batchModel: Model<BatchesModel>,
    @InjectModel('batchRequests')
    private readonly batchRequestsModel: Model<BatchRequestsModel>,
    @Inject(forwardRef(() => TeachersService))
    private readonly teachersService: TeachersService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => StudentsService))
    private readonly studentsService: StudentsService,
  ) {}

  async createNewBatch(user: any, newBatchDTO: NewBatchDTO): Promise<any> {
    try {
      const teacherDetails = await this.teachersService.getTeacherDetails({ teacherId: user.userId });
      const lastBatch = await this.batchModel.findOne().sort({ createdAt: -1 });
      const lastBatchNo = parseInt(lastBatch?.batchNumber?.substr(5, 8)) || 1000;
      const centerNameForBatch = teacherDetails.centerName
        ?.replace(/\s/g, '')
        ?.substr(0, 4)
        .toUpperCase();
      const newBatchNumber = centerNameForBatch + '_' + (lastBatchNo + 1);
      const newBatch = {
        batchNumber: newBatchNumber,
        name: newBatchDTO.name,
        description: newBatchDTO.description,
        batchOwner: 'TEACHER',
        teacherId: user.userId,
      };
      const newBatchResponse = await this.batchModel.create(newBatch);
      return newBatchResponse;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async updateBatch(user: any, updateBatchDTO: UpdateBatchDTO): Promise<any> {
    try {
      const batchDetails = await this.batchModel.findOne({ teacherId: user.userId, _id: Types.ObjectId(updateBatchDTO.batchId) });
      if (updateBatchDTO.name) batchDetails.name = updateBatchDTO.name;
      if (updateBatchDTO.description) batchDetails.description = updateBatchDTO.description;
      batchDetails.save();
      return batchDetails;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async inviteToBatch(user: any, inviteToBatchDTO: InviteToBatchDTO): Promise<any> {
    try {
      const batchDetails = await this.batchModel.findOne({ _id: Types.ObjectId(inviteToBatchDTO.batchId) });
      if (!batchDetails) throw new HttpException("Couldn't find the batch details", 400);

      const teacherDetails = await this.teachersService.getTeacherDetails({ teacherId: user.userId });
      if (!teacherDetails) throw new HttpException("Couldn't find the teacher details", 400);

      const emailIds = inviteToBatchDTO.studentEmailIds.split(',').map(email => email.trim());
      let students = await this.studentsService.findStudentsByEmailIds({ emailIds });

      // Filter out the student who already in the requesting batch
      students = students.filter(student => student?.batchId?.toString() !== batchDetails._id.toString());

      students.map(async student => {
        const newBatchJoinRequest = {
          batchId: batchDetails._id,
          teacherId: batchDetails.teacherId,
          studentId: student._id,
          requestType: BATCH_REQUEST_TYPE.INVITE,
          expiryAt: moment
            .tz('Asia/Calcutta')
            .add(5, 'days')
            .toDate(),
        };
        const batchRequest = await this.batchRequestsModel.create(newBatchJoinRequest);

        // Create notification for batch teacher
        this.notificationsService.createNotification({
          audience: 'STUDENTS',
          expiryAt: moment
            .tz('Asia/Calcutta')
            .add(DEFAULT_NOTIFICATION_EXPIRY_DAYS, 'days')
            .toDate(),
          notificationDate: moment.tz('Asia/Calcutta').toDate(),
          senderId: teacherDetails._id,
          senderRole: ROLES.TEACHER,
          to: [student._id],
          type: NOTIFICATION_TYPES.BATCH_JOIN_NOTIFICATION,
          message: `Teacher ${teacherDetails?.name} has requested you to join in ${batchDetails?.name} batch`,
          batchRequestId: batchRequest._id,
        });
      });

      return { message: 'Batch invitation request sent successfully' };
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async getAllBatches(user: any): Promise<any> {
    try {
      const batches = await this.batchModel.find({ teacherId: Types.ObjectId(user.userId) });
      return batches;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async getStudentsByBatch(user: any, batchId: string): Promise<any> {
    try {
      const batchDetails = await this.batchModel.findOne({ teacherId: Types.ObjectId(user.userId), _id: Types.ObjectId(batchId) });
      if (!batchDetails) throw new HttpException("Batch doesn't exist", 400);
      const students = await this.studentsService.getStudentsByBatches([batchDetails._id]);
      return students;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async getBatchesByTeacher(teacherId: string): Promise<any> {
    try {
      const batches = await this.batchModel.find({ teacherId: Types.ObjectId(teacherId) });
      if (!batches) throw new HttpException("Batch doesn't exist", 400);
      return batches;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async deleteStudentFromBatch(user: any, deleteStudentFromBatchDTO: DeleteStudentFromBatchDTO): Promise<any> {
    try {
      const batchDetails = await this.batchModel.findOne({
        teacherId: Types.ObjectId(user.userId),
        _id: Types.ObjectId(deleteStudentFromBatchDTO.batchId),
      });
      if (!batchDetails) throw new HttpException("Batch doesn't exist", 400);
      await this.studentsService.deleteStudentFromBatch(deleteStudentFromBatchDTO.studentId, batchDetails._id);
      return {};
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async searchBatches(searchBatchDTO: SearchBatchDTO): Promise<any> {
    try {
      const batches = await this.batchModel
        .aggregate([
          {
            $match: {
              _id: { $ne: Types.ObjectId(searchBatchDTO?.exclude) },
              batchNumber: { $regex: new RegExp(`${searchBatchDTO.searchText}`, 'i') },
            },
          },
          {
            $lookup: {
              from: 'teachers',
              localField: 'teacherId',
              foreignField: '_id',
              as: 'teacherDetails',
            },
          },
          {
            $unwind: {
              path: '$teacherDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        ])
        .limit(5);
      return batches;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async getBatchDetails(batchId: string): Promise<any> {
    try {
      const batchDetails = await this.batchModel.findOne({ _id: Types.ObjectId(batchId) });
      return batchDetails;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async joinBatchRequest(user: any, joinBatchDTO: JoinBatchDTO): Promise<any> {
    try {
      const batchDetails = await this.batchModel.findOne({ _id: Types.ObjectId(joinBatchDTO.batchId) });
      if (!batchDetails) throw new HttpException("Couldn't find the batch details", 400);

      // Check if batch request is already present
      const existingBatchRequest = await this.batchRequestsModel.findOne({
        batchId: batchDetails._id,
        status: BATCH_REQUEST_STATUS.PENDING,
        studentId: Types.ObjectId(user.userId),
        requestType: BATCH_REQUEST_TYPE.JOIN,
        expiryAt: { $gt: moment.tz('Asia/Calcutta').toDate() },
      });
      if (existingBatchRequest) throw new HttpException('This batch request is already initiated', 400);

      const studentDetails = await this.studentsService.getStudentDetails({ studentId: user.userId });

      const newBatchJoinRequest = {
        batchId: batchDetails._id,
        teacherId: batchDetails.teacherId,
        studentId: user.userId,
        requestType: BATCH_REQUEST_TYPE.JOIN,
        expiryAt: moment
          .tz('Asia/Calcutta')
          .add(5, 'days')
          .toDate(),
      };
      const batchRequest = await this.batchRequestsModel.create(newBatchJoinRequest);

      // Create notification for batch teacher
      this.notificationsService.createNotification({
        audience: 'TEACHERS',
        expiryAt: moment
          .tz('Asia/Calcutta')
          .add(DEFAULT_NOTIFICATION_EXPIRY_DAYS, 'days')
          .toDate(),
        notificationDate: moment.tz('Asia/Calcutta').toDate(),
        senderId: user.userId,
        senderRole: ROLES.STUDENT,
        to: [batchDetails.teacherId],
        type: NOTIFICATION_TYPES.BATCH_JOIN_NOTIFICATION,
        message: `Student ${studentDetails?.name} has requested to join in your ${batchDetails?.name} batch`,
        batchRequestId: batchRequest._id,
      });

      return batchDetails;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async updateBatchRequest(user: any, acceptBatchRequestDTO: AcceptBatchRequestDTO): Promise<any> {
    try {
      if (
        acceptBatchRequestDTO.status !== BATCH_REQUEST_STATUS.ACCEPTED &&
        acceptBatchRequestDTO.status !== BATCH_REQUEST_STATUS.REJECTED
      ) {
        throw new HttpException('This batch status is not allowed', 400);
      }

      const filter: any = {
        isDeleted: false,
        status: BATCH_REQUEST_STATUS.PENDING,
        _id: Types.ObjectId(acceptBatchRequestDTO.batchRequestId),
      };
      if (user.role === ROLES.STUDENT) {
        filter.studentId = Types.ObjectId(user.userId);
      } else if (ROLES.TEACHER) {
        filter.teacherId = Types.ObjectId(user.userId);
      }
      const batchRequestDetails = await this.batchRequestsModel.findOne(filter);
      if (!batchRequestDetails) {
        throw new HttpException('This batch request does not exist', 400);
      }

      const batchDetails = await this.batchModel.findOne({ _id: batchRequestDetails.batchId });
      if (!batchDetails) throw new HttpException("Couldn't find the batch details", 400);

      const studentDetails = await this.studentsService.getStudentDetails({ studentId: batchRequestDetails.studentId });
      if (!studentDetails) throw new HttpException("Couldn't find the batch details", 400);

      const teacherDetails = await this.teachersService.getTeacherDetails({ teacherId: batchRequestDetails.teacherId });
      if (!teacherDetails) throw new HttpException("Couldn't find the batch details", 400);

      if (acceptBatchRequestDTO.status === BATCH_REQUEST_STATUS.ACCEPTED) {
        batchRequestDetails.completedOn = moment.tz(APP_TIMEZONE).toDate();
        batchRequestDetails.status = BATCH_REQUEST_STATUS.ACCEPTED;
        this.studentsService.updateStudentDetails({
          studentId: batchRequestDetails.studentId,
          studentData: { batchId: batchRequestDetails.batchId },
        });
        batchRequestDetails.save();
      } else {
        batchRequestDetails.status = BATCH_REQUEST_STATUS.REJECTED;
        batchRequestDetails.save();
      }

      // Remove Notification
      let senderId;
      if (batchRequestDetails.requestType === BATCH_REQUEST_TYPE.JOIN) {
        senderId = batchRequestDetails.studentId;
      } else {
        senderId = batchRequestDetails.teacherId;
      }

      this.notificationsService.removeNotification({
        batchRequestId: batchRequestDetails._id,
        senderId,
      });

      // Inform student through Notification
      if (user.role === ROLES.TEACHER) {
        this.notificationsService.createNotification({
          audience: NOTIFICATION_AUDIENCES.STUDENTS,
          expiryAt: moment
            .tz('Asia/Calcutta')
            .add(DEFAULT_NOTIFICATION_EXPIRY_DAYS, 'days')
            .toDate(),
          message: `Your batch request for ${batchDetails.name} has been ${ucFirst(batchRequestDetails.status)}`,
          notificationDate: moment.tz('Asia/Calcutta').toDate(),
          senderId: batchDetails.teacherId,
          senderRole: ROLES.TEACHER,
          to: [batchRequestDetails.studentId],
          type: NOTIFICATION_TYPES.INFORMATIONAL_NOTIFICATION,
        });
      }
      // Inform teacher through Notification
      else {
        this.notificationsService.createNotification({
          audience: NOTIFICATION_AUDIENCES.TEACHERS,
          expiryAt: moment
            .tz('Asia/Calcutta')
            .add(DEFAULT_NOTIFICATION_EXPIRY_DAYS, 'days')
            .toDate(),
          message: `Your batch invite for ${batchDetails.name} has been ${ucFirst(batchRequestDetails.status)} by ${studentDetails.name}`,
          notificationDate: moment.tz('Asia/Calcutta').toDate(),
          senderId: user.userId,
          senderRole: ROLES.STUDENT,
          to: [batchRequestDetails.teacherId],
          type: NOTIFICATION_TYPES.INFORMATIONAL_NOTIFICATION,
        });
      }

      return batchRequestDetails;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async getBatchRequestByTeacher({ teacherId, status = null, requestType = null }): Promise<any> {
    try {
      const filter: any = { teacherId: Types.ObjectId(teacherId) };
      if (status) filter.status = status;
      if (requestType) filter.requestType = requestType;
      const batchRequests = await this.batchRequestsModel.find(filter);
      return batchRequests;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }
}
