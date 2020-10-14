import { Controller, Post, Body, Get, Query, UseGuards, SetMetadata, Req } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExamService } from './exams.service';
import { ROLES } from 'src/constants';
import { GenerateExamDTO } from './dto/GenerateExamDTO';
import { JwtAuthGuard } from './../AuthModule/jwt-auth.guard';
import { RolesGuard } from './../Helpers/CustomGaurds/roles.guard';
import { CaptureAnswerDTO } from './dto/CaptureAnswerDTO';
import { Request } from 'express';

@ApiBearerAuth()
@Controller('/api/exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post('/')
  @SetMetadata('roles', [ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async generateExam(@Body() generateExamDTO: GenerateExamDTO, @Req() request: Request): Promise<any> {
    const user = request.user;
    return await this.examService.generateExam(user, generateExamDTO);
  }

  @Post('/start')
  @SetMetadata('roles', [ROLES.STUDENT, ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async startExam(@Body('examId') examId: string, @Req() request: Request): Promise<any> {
    const user = request.user;
    return await this.examService.startExam(user, examId);
  }

  @Post('/complete')
  @SetMetadata('roles', [ROLES.STUDENT, ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async completeExam(@Body('examId') examId: string, @Req() request: Request): Promise<any> {
    const user = request.user;
    return await this.examService.completeExam(user, examId);
  }

  @Post('/capture')
  @SetMetadata('roles', [ROLES.STUDENT, ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async captureAnswer(@Body() captureAnswerDTO: CaptureAnswerDTO, @Req() request: Request): Promise<any> {
    const user = request.user;
    return await this.examService.captureAnswer(user, captureAnswerDTO);
  }

  @Get('/result')
  @SetMetadata('roles', [ROLES.STUDENT, ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async examResult(@Query('examId') examId: string, @Req() request: Request): Promise<any> {
    const user = request.user;
    return await this.examService.examResult(user, examId);
  }

  @Get('/reports')
  @SetMetadata('roles', [ROLES.STUDENT, ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getExamReports(@Req() request: Request): Promise<any> {
    const user: any = request.user;
    return await this.examService.getExamReports({ userId: user.userId });
  }

  @Get('/acl-details')
  @SetMetadata('roles', [ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getACLExamDetails(@Query('aclExamId') aclExamId: string, @Req() request: Request): Promise<any> {
    const user = request.user;
    return await this.examService.getACLExamDetails(user, aclExamId);
  }

  @Get('/completed')
  @SetMetadata('roles', [ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async completedExams(@Query('examType') examType: string, @Req() request: Request): Promise<any> {
    const user = request.user;
    return await this.examService.getCompletedExamDetails(examType, user);
  }

  @Get('/results')
  @SetMetadata('roles', [ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getExamResults(@Query('examId') examId: string, @Query('limit') limit: string): Promise<any> {
    return await this.examService.getExamResults(examId, limit);
  }

  @Get('/recent-wcl-report')
  @SetMetadata('roles', [ROLES.STUDENT])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getRecentWCLReport(@Req() request: Request): Promise<any> {
    const user = request.user;
    return await this.examService.getRecentWCLReport(user);
  }

  @Get('/notice-board/wcl-star')
  @SetMetadata('roles', [ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getWCLStarDetails(@Req() request: Request): Promise<any> {
    const user = request.user;
    return await this.examService.getWCLStarDetails(user);
  }
}
