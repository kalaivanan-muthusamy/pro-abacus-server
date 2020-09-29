/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable, InternalServerErrorException, HttpException, forwardRef, Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { StudentsModel } from './students.schema';
import { StudentRegisterDTO } from './dto/StudentRegisterDTO';
import * as bcyrpt from 'bcrypt';
import { BatchesService } from './../Batches/batches.service';
import * as fs from 'fs';
import { normalize } from 'path';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel('students')
    private readonly studentModel: Model<StudentsModel>,
    @Inject(forwardRef(() => BatchesService))
    private readonly batchesService: BatchesService,
  ) {}

  async studentRegister(studentRegisterDTO: StudentRegisterDTO): Promise<any> {
    try {
      const encryptedPassword = bcyrpt.hashSync(studentRegisterDTO.password, parseInt(process.env.PASSWORD_HASH_SALT_ROUND));
      const student = {
        name: studentRegisterDTO.name,
        email: studentRegisterDTO.email,
        password: encryptedPassword,
        gender: studentRegisterDTO.gender,
        age: studentRegisterDTO.age,
      };
      const studentResponse = await this.studentModel.create(student);
      return studentResponse;
    } catch (err) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getStudentDetails({ studentId }): Promise<any> {
    try {
      const studentResponse: any = await this.studentModel.findOne({ _id: Types.ObjectId(studentId) }).lean();
      if (studentResponse?.batchId) {
        const batchDetails = await this.batchesService.getBatchDetails(studentResponse?.batchId.toHexString());
        studentResponse.batchDetails = batchDetails;
      }
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
