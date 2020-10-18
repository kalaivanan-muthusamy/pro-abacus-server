/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Controller, Post, Body, SetMetadata, UseGuards, Get, Req, Put, UseInterceptors, UploadedFile, Query, Param } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { StudentRegisterDTO } from './dto/StudentRegisterDTO';
import { ROLES } from 'src/constants';
import { RolesGuard } from './../Helpers/CustomGaurds/roles.guard';
import { JwtAuthGuard } from './../AuthModule/jwt-auth.guard';
import { Request } from 'express';
import { UpdateStudentDTO } from './dto/UpdateStudentDTO';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { customFileName } from 'src/Helpers/File';
import { imageFileFilter } from './../Helpers/File/index';
import { StudentEmailVerificationDTO } from './dto/StudentEmailVerificationDTO';
import { ResetPasswordDTO } from './dto/ResetPasswordDTO';

@ApiBearerAuth()
@Controller('/api/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('/')
  async register(@Body() studentRegisterDTO: StudentRegisterDTO): Promise<any> {
    return this.studentsService.studentRegister(studentRegisterDTO);
  }

  @Post('/verify')
  async verifyStudentEmail(@Body() studentEmailVerificationDTO: StudentEmailVerificationDTO): Promise<any> {
    return this.studentsService.verifyStudentEmail(studentEmailVerificationDTO);
  }

  @Post('/forgot-password-request')
  async forgotPasswordRequest(@Body('email') email: string): Promise<any> {
    return this.studentsService.forgotPasswordRequest(email);
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDTO: ResetPasswordDTO): Promise<any> {
    return this.studentsService.resetPassword(resetPasswordDTO);
  }

  @Get('/')
  @SetMetadata('roles', [ROLES.STUDENT])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getProfileDetails(@Req() request: Request): Promise<any> {
    const user: any = request.user;
    return this.studentsService.getStudentDetails({ studentId: user.userId });
  }

  @Get('/list')
  @SetMetadata('roles', [ROLES.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllStudents(): Promise<any> {
    return this.studentsService.getAllStudents();
  }

  @Get('/:userId')
  @SetMetadata('roles', [ROLES.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getStudentDetails(@Param('userId') userId: string): Promise<any> {
    return this.studentsService.getStudentDetails({ studentId: userId });
  }

  @Put('/')
  @SetMetadata('roles', [ROLES.STUDENT])
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
  async updateProfile(
    @Req() request: Request,
    @Body() updateStudentDTO: UpdateStudentDTO,
    @UploadedFile() profileImage: any,
  ): Promise<any> {
    const user: any = request.user;
    return this.studentsService.updateStudentDetails({ studentId: user.userId, studentData: updateStudentDTO, profileImage });
  }
}
