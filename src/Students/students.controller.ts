import { Controller, Post, Body, SetMetadata, UseGuards, Get, Req } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { StudentRegisterDTO } from './dto/StudentRegisterDTO';
import { ROLES } from 'src/constants';
import { RolesGuard } from './../Helpers/CustomGaurds/roles.guard';
import { JwtAuthGuard } from './../AuthModule/jwt-auth.guard';
import { Request } from 'express';

@ApiBearerAuth()
@Controller('/api/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('/')
  @SetMetadata('roles', [ROLES.STUDENT])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async register(@Body() studentRegisterDTO: StudentRegisterDTO): Promise<any> {
    return this.studentsService.studentRegister(studentRegisterDTO);
  }

  @Get('/')
  @SetMetadata('roles', [ROLES.STUDENT])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getProfileDetails(@Req() request: Request): Promise<any> {
    const user: any = request.user;
    return this.studentsService.getStudentDetails({ studentId: user.userId });
  }
}
