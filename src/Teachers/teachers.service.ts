import { Injectable, InternalServerErrorException, HttpException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcyrpt from 'bcrypt';
import { TeacherRegistrationDTO } from './dto/TeacherRegisterDTO';
import { TeachersModel } from './teachers.schema';

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
}
