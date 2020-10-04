import { Injectable, InternalServerErrorException, HttpException } from '@nestjs/common';
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

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel('teachers')
    private readonly teacherModel: Model<TeachersModel>,
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
          <p><a href='https://proabacus.com/email-verify/teachers/${encodeURIComponent(
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
}
