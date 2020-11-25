import { Injectable, BadRequestException } from '@nestjs/common';
import { AuthenticationDTO } from './dto/AuthenticationDTO';
import { ROLES } from 'src/constants';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminsModel } from './../Admins/admins.schema';
import { compare } from 'bcrypt';
import { StudentsModel } from 'src/Students/students.schema';
import { TeachersModel } from 'src/Teachers/teachers.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('students')
    private studentModel: Model<StudentsModel>,
    @InjectModel('teachers')
    private teachersModel: Model<TeachersModel>,
    @InjectModel('admins')
    private adminModel: Model<AdminsModel>,
    private jwtService: JwtService,
  ) {}

  async doAuthentication(authenticationDTO: AuthenticationDTO): Promise<any> {
    if (authenticationDTO.role === ROLES.STUDENT) {
      const student = await this.studentModel.findOne({
        email: authenticationDTO.email,
      });
      if (!student) throw new BadRequestException("Email Id doesn't exist");
      if (!student.emailVerified) throw new BadRequestException('Email is not verified yet!');
      if (!student.enabled) throw new BadRequestException('You account has been disabled');
      if (!(await compare(authenticationDTO.password, student.password))) {
        throw new BadRequestException('Invalid password');
      }
      return {
        studentId: student._id,
        name: student.name,
        email: student.email,
        accessToken: this.jwtService.sign({
          userId: student._id,
          role: ROLES.STUDENT,
          email: student.email,
        }),
        role: ROLES.STUDENT,
      };
    } else if (authenticationDTO.role === ROLES.TEACHER) {
      const teacher = await this.teachersModel.findOne({
        email: authenticationDTO.email,
      });
      if (!teacher) throw new BadRequestException("Email Id doesn't exist");
      if (!teacher.enabled) throw new BadRequestException('You account has been disabled');
      if (!teacher.emailVerified) throw new BadRequestException('Email is not verified yet!');
      if (!(await compare(authenticationDTO.password, teacher.password))) {
        throw new BadRequestException('Invalid password');
      }
      return {
        studentId: teacher._id,
        name: teacher.name,
        email: teacher.email,
        accessToken: this.jwtService.sign({
          userId: teacher._id,
          role: ROLES.TEACHER,
          email: teacher.email,
        }),
        role: ROLES.TEACHER,
      };
    } else if (authenticationDTO.role === ROLES.ADMIN) {
      const admin = await this.adminModel.findOne({
        email: authenticationDTO.email,
      });
      if (!admin) throw new BadRequestException("Email Id doesn't exist");
      if (!(await compare(authenticationDTO.password, admin.password))) {
        throw new BadRequestException('Invalid password');
      }
      return {
        adminId: admin._id,
        name: admin.name,
        email: admin.email,
        accessToken: this.jwtService.sign({
          userId: admin._id,
          role: ROLES.ADMIN,
          email: admin.email,
        }),
        role: ROLES.ADMIN,
      };
    } else {
      throw new BadRequestException('Invalid authentication method');
    }
  }
}
