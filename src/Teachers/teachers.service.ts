import { Injectable, InternalServerErrorException, HttpException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcyrpt from 'bcrypt';
import { TeacherRegistrationDTO } from './dto/TeacherRegisterDTO';
import { TeachersModel } from './teachers.schema';
import * as fs from 'fs';

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel('teachers')
    private readonly teacherModel: Model<TeachersModel>,
  ) {}

  async register(teacherRegistrationDTO: TeacherRegistrationDTO): Promise<any> {
    try {
      const encryptedPassword = bcyrpt.hashSync(teacherRegistrationDTO.password, parseInt(process.env.PASSWORD_HASH_SALT_ROUND));
      const teacher = {
        name: teacherRegistrationDTO.name,
        email: teacherRegistrationDTO.email,
        password: encryptedPassword,
        gender: teacherRegistrationDTO.gender,
        age: teacherRegistrationDTO.age,
        centerName: teacherRegistrationDTO.centerName,
      };
      const teacherResponse = await this.teacherModel.create(teacher);
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
