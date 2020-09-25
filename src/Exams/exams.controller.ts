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
  @SetMetadata('roles', [ROLES.STUDENT, ROLES.TEACHER])
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
}
