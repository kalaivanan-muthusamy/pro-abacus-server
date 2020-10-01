/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Controller, Post, Body, SetMetadata, UseGuards, Get, Req, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
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

@ApiBearerAuth()
@Controller('/api/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('/')
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
