/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable, InternalServerErrorException, HttpException, forwardRef, Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as bcyrpt from 'bcrypt';
import * as moment from 'moment-timezone';
import { StudentsModel } from './students.schema';
import { StudentRegisterDTO } from './dto/StudentRegisterDTO';
import { BatchesService } from './../Batches/batches.service';
import { MailService } from './../Mail/mail.service';
import { StudentEmailVerificationDTO } from './dto/StudentEmailVerificationDTO';
import { ResetPasswordDTO } from './dto/ResetPasswordDTO';
import { LevelsService } from './../Levels/levels.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel('students')
    private readonly studentModel: Model<StudentsModel>,
    @Inject(forwardRef(() => BatchesService))
    private readonly batchesService: BatchesService,
    private readonly levelsService: LevelsService,
    private readonly mailService: MailService,
  ) {}

  async verifyStudentEmail(emailVerificationDTO: StudentEmailVerificationDTO): Promise<any> {
    try {
      // Check if the student exist
      const existingStudent = await this.studentModel.findOne({ email: emailVerificationDTO.email });
      if (!existingStudent) {
        throw new HttpException("This student doesn't exist", 400);
      }
      if (existingStudent && existingStudent.emailVerified) {
        throw new HttpException('This email is already verified', 400);
      }

      if (existingStudent.emailVerificationHash !== emailVerificationDTO.hash) {
        throw new HttpException("Couldn't verify this email", 400);
      } else {
        existingStudent.emailVerified = true;
        existingStudent.save();
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
      const existingStudent = await this.studentModel.findOne({ email });
      if (!existingStudent) {
        throw new HttpException("This student doesn't exist", 400);
      }
      if (existingStudent && !existingStudent.emailVerified) {
        throw new HttpException('This email is not verified', 400);
      }

      const forgotPasswordHash = crypto.createHash('sha256').digest('hex');
      existingStudent.forgotPasswordHash = forgotPasswordHash;
      existingStudent.forgotPasswordExpiryDate = moment
        .tz('Asia/Calcutta')
        .add(1, 'hour')
        .toDate();
      existingStudent.save();

      // Send Email Verification
      this.mailService.sendMail({
        to: email,
        subject: 'Reset password link -Pro Abacus',
        html: `
          <p>Click the blow link to reset your password</p>
          <p><a href='https://proabacus.com/reset-password/student/${encodeURIComponent(
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

  async resetPassword(resetPasswordDTO: ResetPasswordDTO): Promise<any> {
    try {
      // Check if the student exist
      const existingStudent = await this.studentModel.findOne({ email: resetPasswordDTO.email });
      if (!existingStudent) {
        throw new HttpException("This student doesn't exist", 400);
      }
      if (existingStudent && !existingStudent.emailVerified) {
        throw new HttpException('This email is not verified', 400);
      }
      const currentDate = moment.tz('Asia/Calcutta');
      if (currentDate.isAfter(moment.tz(existingStudent.forgotPasswordExpiryDate, 'Asia/Calcutta'))) {
        throw new HttpException('This reset password link is expired', 400);
      }

      if (existingStudent.forgotPasswordHash === resetPasswordDTO.hash) {
        const encryptedPassword = bcyrpt.hashSync(resetPasswordDTO.password, parseInt(process.env.PASSWORD_HASH_SALT_ROUND));
        existingStudent.forgotPasswordHash = null;
        existingStudent.forgotPasswordExpiryDate = null;
        existingStudent.password = encryptedPassword;
        existingStudent.save();
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

  async studentRegister(studentRegisterDTO: StudentRegisterDTO): Promise<any> {
    try {
      // Check if the student exist
      const existingStudent = await this.studentModel.findOne({ email: studentRegisterDTO.email });
      if (existingStudent) {
        throw new HttpException('Student already exist', 400);
      }

      const encryptedPassword = bcyrpt.hashSync(studentRegisterDTO.password, parseInt(process.env.PASSWORD_HASH_SALT_ROUND));
      const emailVerificationHash = crypto.createHash('sha256').digest('hex');
      const student = {
        name: studentRegisterDTO.name,
        email: studentRegisterDTO.email,
        password: encryptedPassword,
        gender: studentRegisterDTO.gender,
        levelId: Types.ObjectId(studentRegisterDTO.levelId),
        age: studentRegisterDTO.age,
        emailVerificationHash,
      };
      const studentResponse = await this.studentModel.create(student);

      // Send Email Verification
      this.mailService.sendMail({
        to: studentRegisterDTO.email,
        subject: 'Thanks for registering with Pro Abacus',
        html: `<p>Thanks for registering with Pro Abacus<p>
          <p>Click the blow link to verify your email and proceed to login</p>
          <p><a href='https://proabacus.com/email-verify/student/${encodeURIComponent(
            studentRegisterDTO.email,
          )}/${emailVerificationHash}'>Verify Email</a></p>`,
      });

      return studentResponse;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getStudentDetails({ studentId }): Promise<any> {
    try {
      const studentResponse: any = await this.studentModel
        .findOne({ _id: Types.ObjectId(studentId) })
        .populate('batchDetails', 'batchNumber,name')
        .populate('levelDetails', 'name');
      return studentResponse;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async updateStudentDetails({ studentId, studentData, profileImage = null }): Promise<any> {
    try {
      const studentDetails: any = await this.studentModel.findOne({ _id: Types.ObjectId(studentId) });
      if (!studentDetails) throw new HttpException("Couldn't find the student details", 400);

      if (profileImage) {
        // Delete the existing profile image
        if (studentDetails.profileImage) {
          fs.unlink(studentDetails.profileImage, () => '');
        }
        studentDetails.profileImage = profileImage.path;
      }

      if (studentData?.batchId) {
        studentDetails.batchId = studentData?.batchId;
      }

      if (studentData?.name) {
        studentDetails.name = studentData?.name;
      }

      if (studentData?.email) {
        studentDetails.email = studentData?.email;
      }

      if (studentData?.gender) {
        studentDetails.gender = studentData?.gender;
      }

      if (studentData?.age) {
        studentDetails.age = studentData?.age;
      }

      if (studentData?.password) {
        const encryptedPassword = bcyrpt.hashSync(studentData?.password, parseInt(process.env.PASSWORD_HASH_SALT_ROUND));
        studentDetails.password = encryptedPassword;
      }

      if (studentData?.levelId && studentData?.levelId !== studentDetails?.levelId?.toHexString()) {
        // Validate if the level is higher that current level
        const allLevels = await this.levelsService.getAllLevels();
        const currentLevel = allLevels.find(level => level?._id?.toHexString?.() === studentDetails?.levelId?.toHexString?.());
        const newLevel = allLevels.find(level => level?._id?.toHexString?.() === studentData?.levelId);
        if (newLevel?.orderValue > currentLevel?.orderValue) {
          // TODO - The student must complete at-least two WCL on current level to upgrade to next level
          console.info('Need validation');
        }
        studentDetails.levelId = studentData?.levelId;
      }

      studentDetails.save();

      return studentDetails;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async findStudentsByEmailIds({ emailIds }): Promise<any> {
    try {
      const students: any = await this.studentModel.find({ email: { $in: emailIds } });
      return students;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }
}
