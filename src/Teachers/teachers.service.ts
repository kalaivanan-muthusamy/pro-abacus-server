/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable, InternalServerErrorException, HttpException, forwardRef, Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcyrpt from 'bcrypt';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import { TeacherRegistrationDTO } from './dto/TeacherRegisterDTO';
import { TeachersModel } from './teachers.schema';
import { TeacherEmailVerificationDTO } from './dto/TeacherEmailVerificationDTO';
import { MailService } from './../Mail/mail.service';
import { TeacherResetPasswordDTO } from './dto/TeacherResetPasswordDTO';
import { APP_TIMEZONE } from 'src/configs';
import { BatchesService } from './../Batches/batches.service';
import { StudentsService } from './../Students/students.service';
import { ExamService } from './../Exams/exams.service';
import { BATCH_REQUEST_STATUS } from 'src/constants';
import { EXAM_TYPES } from 'src/constants';

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel('teachers')
    private readonly teacherModel: Model<TeachersModel>,
    @Inject(forwardRef(() => BatchesService))
    private readonly batchesService: BatchesService,
    @Inject(forwardRef(() => StudentsService))
    private readonly studentsService: StudentsService,
    @Inject(forwardRef(() => ExamService))
    private readonly examService: ExamService,
    private readonly mailService: MailService,
  ) {}

  async register(teacherRegistrationDTO: TeacherRegistrationDTO): Promise<any> {
    try {
      // Check if the teacher exist
      const existingTeacher = await this.teacherModel.findOne({ email: teacherRegistrationDTO.email });
      if (existingTeacher) {
        throw new HttpException('Teacher already exist', 400);
      }

      const emailVerificationHash = crypto.createHash('sha256').digest('hex');
      const encryptedPassword = bcyrpt.hashSync(teacherRegistrationDTO.password, parseInt(process.env.PASSWORD_HASH_SALT_ROUND));
      const teacher = {
        name: teacherRegistrationDTO.name,
        email: teacherRegistrationDTO.email,
        password: encryptedPassword,
        gender: teacherRegistrationDTO.gender,
        age: teacherRegistrationDTO.age,
        centerName: teacherRegistrationDTO.centerName,
        emailVerificationHash,
      };
      const teacherResponse = await this.teacherModel.create(teacher);

      // Send Email Verification
      this.mailService.sendMail({
        to: teacherRegistrationDTO.email,
        subject: 'Thanks for registering with Pro Abacus',
        html: `<p>Thanks for registering with Pro Abacus<p>
          <p>Click the blow link to verify your email and proceed to login</p>
          <p><a href='https://proabacus.com/email-verify/teacher/${encodeURIComponent(
            teacherRegistrationDTO.email,
          )}/${emailVerificationHash}'>Verify Email</a></p>`,
      });

      return teacherResponse;
    } catch (err) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getTeacherDetails({ teacherId }): Promise<any> {
    try {
      const teacher = await this.teacherModel.findOne({ _id: teacherId });
      return teacher;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async getTeacherDetailsByBatchId({ batchId }): Promise<any> {
    try {
      const batchDetails = await this.batchesService.getBatchDetails(batchId);
      if (!batchDetails) throw new HttpException("Couldn't get the batch details", 400);

      const teacherDetails = await this.getTeacherDetails({ teacherId: batchDetails.teacherId });
      if (!teacherDetails) throw new HttpException("Couldn't get the teacher details", 400);

      return teacherDetails;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async verifyTeacherEmail(emailVerificationDTO: TeacherEmailVerificationDTO): Promise<any> {
    try {
      // Check if the teacher exist
      const existingTeacher = await this.teacherModel.findOne({ email: emailVerificationDTO.email });
      if (!existingTeacher) {
        throw new HttpException("This teacher doesn't exist", 400);
      }
      if (existingTeacher && existingTeacher.emailVerified) {
        throw new HttpException('This email is already verified', 400);
      }

      if (existingTeacher.emailVerificationHash !== emailVerificationDTO.hash) {
        throw new HttpException("Couldn't verify this email", 400);
      } else {
        existingTeacher.emailVerified = true;
        existingTeacher.save();
      }

      return { message: 'Email verified successfully ' };
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async forgotPasswordRequest(email: string): Promise<any> {
    try {
      // Check if the student exist
      const existingTeacher = await this.teacherModel.findOne({ email });
      if (!existingTeacher) {
        throw new HttpException("This student doesn't exist", 400);
      }
      if (existingTeacher && !existingTeacher.emailVerified) {
        throw new HttpException('This email is not verified', 400);
      }

      const forgotPasswordHash = crypto.createHash('sha256').digest('hex');
      existingTeacher.forgotPasswordHash = forgotPasswordHash;
      existingTeacher.forgotPasswordExpiryDate = moment
        .tz('Asia/Calcutta')
        .add(1, 'hour')
        .toDate();
      existingTeacher.save();

      // Send Email Verification
      this.mailService.sendMail({
        to: email,
        subject: 'Reset password link -Pro Abacus',
        html: `
          <p>Click the blow link to reset your password</p>
          <p><a href='https://proabacus.com/reset-password/teacher/${encodeURIComponent(
            email,
          )}/${forgotPasswordHash}'>Reset Password</a></p>`,
      });

      return { message: 'Reset password link have been sent successfully ' };
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async resetPassword(teacherResetPasswordDTO: TeacherResetPasswordDTO): Promise<any> {
    try {
      // Check if the teacher exist
      const existingTeacher = await this.teacherModel.findOne({ email: teacherResetPasswordDTO.email });
      if (!existingTeacher) {
        throw new HttpException("This teacher doesn't exist", 400);
      }
      if (!existingTeacher.emailVerified) {
        throw new HttpException('This email is not verified', 400);
      }
      const currentDate = moment.tz('Asia/Calcutta');
      if (currentDate.isAfter(moment.tz(existingTeacher.forgotPasswordExpiryDate, 'Asia/Calcutta'))) {
        throw new HttpException('This reset password link is expired', 400);
      }

      if (existingTeacher.forgotPasswordHash === teacherResetPasswordDTO.hash) {
        const encryptedPassword = bcyrpt.hashSync(teacherResetPasswordDTO.password, parseInt(process.env.PASSWORD_HASH_SALT_ROUND));
        existingTeacher.forgotPasswordHash = null;
        existingTeacher.forgotPasswordExpiryDate = null;
        existingTeacher.password = encryptedPassword;
        existingTeacher.save();
      } else {
        throw new HttpException("Couldn't reset the password. Reset password link is broken", 400);
      }
      return { message: 'Password has been reset successfully ' };
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async updateTeacherDetails({ teacherId, teacherData, profileImage = null }): Promise<any> {
    try {
      const teacherDetails: any = await this.teacherModel.findOne({ _id: Types.ObjectId(teacherId) });
      if (!teacherDetails) throw new HttpException("Couldn't find the teacher details", 400);

      console.log('profileImage', profileImage);

      if (profileImage) {
        // Delete the existing profile image
        if (teacherDetails.profileImage) {
          fs.unlink(teacherDetails.profileImage, () => '');
        }
        teacherDetails.profileImage = profileImage.path;
      }

      if (teacherData?.batchId) {
        teacherDetails.batchId = teacherData?.batchId;
      }

      if (teacherData?.name) {
        teacherDetails.name = teacherData?.name;
      }

      if (teacherData?.centerName) {
        teacherDetails.centerName = teacherData?.centerName;
      }

      if (teacherData?.email) {
        teacherDetails.email = teacherData?.email;
      }

      if (teacherData?.gender) {
        teacherDetails.gender = teacherData?.gender;
      }

      if (teacherData?.age) {
        teacherDetails.age = teacherData?.age;
      }

      if (teacherData?.password) {
        const encryptedPassword = bcyrpt.hashSync(teacherData?.password, parseInt(process.env.PASSWORD_HASH_SALT_ROUND));
        teacherDetails.password = encryptedPassword;
      }

      teacherDetails.save();

      return teacherDetails;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async getAllTeachers(): Promise<any> {
    try {
      const teachers: any = await this.teacherModel.find();
      return teachers;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async isValidSubscription(teacherId: string): Promise<any> {
    try {
      const teacherDetails: any = await this.teacherModel.findOne({ _id: Types.ObjectId(teacherId) });
      if (!teacherDetails?.subscriptionDetails?.expiryAt) return false;
      const currentTime = moment.tz(APP_TIMEZONE);
      const subscriptionExpiryDate = moment.tz(teacherDetails.subscriptionDetails.expiryAt, APP_TIMEZONE);
      if (subscriptionExpiryDate > currentTime) return true;
      return false;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async updateSubscriptionDetails({ teacherId, expiryAt }): Promise<any> {
    try {
      const teacherDetails = await await this.teacherModel.findOne({ _id: Types.ObjectId(teacherId) });
      if (!teacherDetails) throw new HttpException("Couldn't find the teacher details", 400);
      if (teacherDetails?.subscriptionDetails) {
        teacherDetails.subscriptionDetails.expiryAt = expiryAt;
      } else {
        teacherDetails.subscriptionDetails = { expiryAt };
      }
      await teacherDetails.save();
      return teacherDetails;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async getStudentStats(user: any): Promise<any> {
    try {
      const batches = await this.batchesService.getBatchesByTeacher(user.userId);
      const batchIds = batches.map(batch => batch._id);
      const students = await this.studentsService.getStudentsByBatches(batchIds);
      const examResultStats = await this.examService.getCompletedExamResultsByBatchIds({ batchIds });
      const assessments = await this.examService.getAssessmentsByTeacher(user.userId);
      return {
        totalStudents: students.length,
        totalAssessments: assessments?.length || 0,
        ACLParticipatedStudents: examResultStats.ACLParticipated,
        WCLParticipatedStudents: examResultStats.WCLParticipated,
        ACLWonStudents: examResultStats.ACLWon,
        WCLWonStudents: examResultStats.WCLWon,
      };
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async getStudentsJoiningTrend(user: any): Promise<any> {
    try {
      const requests = await this.batchesService.getBatchRequestByTeacher({
        teacherId: user.userId,
        status: BATCH_REQUEST_STATUS.ACCEPTED,
      });

      const groupedRequest = {};
      requests.map(request => {
        const completedOn = moment.tz(request.completedOn, APP_TIMEZONE);
        const key = completedOn.format('MMM-YYYY');
        if (groupedRequest[key]) {
          groupedRequest[key].push(request);
        } else {
          groupedRequest[key] = [request];
        }
      });
      const keys = [];
      const values = [];
      Object.keys(groupedRequest).map(key => {
        keys.push(key);
        values.push(groupedRequest[key].length);
      });

      return {
        keys,
        values,
      };
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async getStudentsParticipantsReport(user: any): Promise<any> {
    try {
      const batches = await this.batchesService.getBatchesByTeacher(user.userId);
      const batchIds = batches.map(batch => batch._id);
      console.log('batchIds', batchIds);
      const examReports = await this.examService.getParticipantsReport({ batchIds, examTypes: [EXAM_TYPES.ACL, EXAM_TYPES.WCL] });
      const WCLExams = examReports.filter(exam => exam.examType === EXAM_TYPES.WCL);
      const ACLExams = examReports.filter(exam => exam.examType === EXAM_TYPES.ACL);

      const WCLByExamGroup = {};
      WCLExams.map(exam => {
        const key = exam.examDetails._id;
        if (WCLByExamGroup[key]) {
          WCLByExamGroup[key].push(exam);
        } else {
          WCLByExamGroup[key] = [exam];
        }
      });
      const WCLReports = Object.keys(WCLByExamGroup).map(examId => ({
        examName: WCLByExamGroup[examId]?.[0]?.examDetails?.name,
        examDate: WCLByExamGroup[examId]?.[0]?.examDetails?.examDate,
        participated: WCLExams.length,
        won: WCLExams.filter(result => result.isWCLStar).length,
      }));

      const ACLExamGroup = {};
      ACLExams.map(exam => {
        const key = exam.examDetails._id;
        if (ACLExamGroup[key]) {
          ACLExamGroup[key].push(exam);
        } else {
          ACLExamGroup[key] = [exam];
        }
      });
      const ACLReports = Object.keys(ACLExamGroup).map(examId => ({
        examName: ACLExamGroup[examId]?.[0]?.examDetails?.name,
        examDate: ACLExamGroup[examId]?.[0]?.examDetails?.examDate,
        participated: ACLExams.length,
        won: WCLExams.filter(result => result.isWCLStar).length,
      }));

      return {
        WCLReports,
        ACLReports,
      };
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }
}
