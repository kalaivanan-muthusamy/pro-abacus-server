import { Injectable, InternalServerErrorException, HttpException, forwardRef, Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { StudentsModel } from './students.schema';
import { StudentRegisterDTO } from './dto/StudentRegisterDTO';
import * as bcyrpt from 'bcrypt';
import { BatchesService } from './../Batches/batches.service';

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
        console.info('batchDetails', batchDetails);
        studentResponse.batchDetails = batchDetails;
      }
      return studentResponse;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async updateStudentDetails({ studentId, studentData }): Promise<any> {
    try {
      const studentDetails: any = await this.studentModel.findOne({ _id: Types.ObjectId(studentId) });

      if (studentData?.batchId) {
        studentDetails.batchId = studentData?.batchId;
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
