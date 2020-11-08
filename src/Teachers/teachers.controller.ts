/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Controller, Post, Body, SetMetadata, UseGuards, Req, Get, Put, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TeacherRegistrationDTO } from './dto/TeacherRegisterDTO';
import { TeachersService } from './teachers.service';
import { ROLES } from 'src/constants';
import { RolesGuard } from './../Helpers/CustomGaurds/roles.guard';
import { JwtAuthGuard } from './../AuthModule/jwt-auth.guard';
import { Request } from 'express';
import { UpdateTeacherDTO } from './dto/UpdateTeacherDTO';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { customFileName } from 'src/Helpers/File';
import { imageFileFilter } from './../Helpers/File/index';
import { TeacherEmailVerificationDTO } from './dto/TeacherEmailVerificationDTO';
import { TeacherResetPasswordDTO } from './dto/TeacherResetPasswordDTO';

@ApiBearerAuth()
@Controller('/api/teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post('/')
  async register(@Body() teacherRegistrationDTO: TeacherRegistrationDTO): Promise<any> {
    return this.teachersService.register(teacherRegistrationDTO);
  }

  @Post('/verify')
  async verifyTeacherEmail(@Body() teacherEmailVerificationDTO: TeacherEmailVerificationDTO): Promise<any> {
    return this.teachersService.verifyTeacherEmail(teacherEmailVerificationDTO);
  }

  @Post('/forgot-password-request')
  async forgotPasswordRequest(@Body('email') email: string): Promise<any> {
    return this.teachersService.forgotPasswordRequest(email);
  }

  @Post('/reset-password')
  async resetPassword(@Body() teacherResetPasswordDTO: TeacherResetPasswordDTO): Promise<any> {
    return this.teachersService.resetPassword(teacherResetPasswordDTO);
  }

  @Get('/')
  @SetMetadata('roles', [ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getTeachersDetails(@Req() request: Request): Promise<any> {
    const user: any = request.user;
    return this.teachersService.getTeacherDetails({ teacherId: user.userId });
  }

  @Put('/')
  @SetMetadata('roles', [ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: 'uploads',
        filename: customFileName,
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 1000000 }, // 1MB
    }),
  )
  async updateTeacher(
    @Req() request: Request,
    @Body() updateTeacherDTO: UpdateTeacherDTO,
    @UploadedFile() profileImage: any,
  ): Promise<any> {
    const user: any = request.user;
    return this.teachersService.updateTeacherDetails({
      teacherId: user.userId,
      teacherData: updateTeacherDTO,
      profileImage,
    });
  }

  @Get('/list')
  @SetMetadata('roles', [ROLES.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllTeachers(): Promise<any> {
    return this.teachersService.getAllTeachers();
  }

  @Get('/student-stats')
  @SetMetadata('roles', [ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getStudentStats(@Req() request: Request): Promise<any> {
    const user = request.user;
    return this.teachersService.getStudentStats(user);
  }

  @Get('/student-joining-trend')
  @SetMetadata('roles', [ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getStudentsJoiningTrend(@Req() request: Request): Promise<any> {
    const user = request.user;
    return this.teachersService.getStudentsJoiningTrend(user);
  }

  @Get('/student-participants-report')
  @SetMetadata('roles', [ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getStudentsParticipantsReport(@Req() request: Request): Promise<any> {
    const user = request.user;
    return this.teachersService.getStudentsParticipantsReport(user);
  }

  @Get('/:userId')
  @SetMetadata('roles', [ROLES.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getTeacherDetails(@Param('userId') userId: string): Promise<any> {
    return this.teachersService.getTeacherDetails({ teacherId: userId });
  }
}
