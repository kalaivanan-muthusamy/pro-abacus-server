/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment-timezone';
import { ExamModel, AnswerModel } from './exams.schema';
import { GenerateExamDTO } from './dto/GenerateExamDTO';
import { generateAllQuestions } from './helpers/GenerateQuestions';
import { CaptureAnswerDTO } from './dto/CaptureAnswerDTO';
import { EXAM_TYPES, NOTIFICATION_TYPES } from 'src/constants';
import { ROLES } from './../constants';
import { StudentsService } from './../Students/students.service';
import { NotificationsService } from './../Notifications/notifications.service';
import { NOTIFICATION_AUDIENCES } from './../constants';
import { EXAM_BUFFER_TIME } from './../configs';
import { LevelsService } from './../Levels/levels.service';
import { LevelsModel } from 'src/Levels/levels.schema';

@Injectable()
export class ExamService {
  constructor(
    @InjectModel('exams')
    private readonly examModel: Model<ExamModel>,
    @InjectModel('answers')
    private readonly answerModel: Model<AnswerModel>,
    private readonly studentsService: StudentsService,
    private readonly notificationsService: NotificationsService,
    private readonly levelsService: LevelsService,
  ) {}

  async generateExam(user: any, examGenerationDTO: GenerateExamDTO): Promise<any> {
    try {
      if (examGenerationDTO.examType == EXAM_TYPES.WCL) {
        return await this.generateWCLExam(user, examGenerationDTO);
      } else if (examGenerationDTO.examType == EXAM_TYPES.ACL) {
        return await this.generateACLExam(user, examGenerationDTO);
      } else {
        const splitUps = JSON.parse(examGenerationDTO.splitUps);
        const newExam = {
          examType: examGenerationDTO.examType,
          examCategory: 'SIMPLE_ABACUS_EXAM',
          splitUps,
          questions: generateAllQuestions(splitUps),
          name: examGenerationDTO.name,
          description: examGenerationDTO.description,
          examDate: examGenerationDTO.examDate ? moment.tz(examGenerationDTO.examDate, 'Asia/Calcutta').toDate() : undefined,
          batchIds: <Types.ObjectId[]>(<unknown>examGenerationDTO.batchIds?.split(',')) || undefined,
          duration: examGenerationDTO.duration,
          levels: <Types.ObjectId[]>(<unknown>examGenerationDTO.levelIds?.split(',')) || undefined,
          resultDelay: examGenerationDTO.resultDelay,
          userId: user.userId,
        };
        const examResponse = await this.examModel.create(newExam);

        // Create Notification for ASSESSMENT EXAM
        if (examGenerationDTO.examType === EXAM_TYPES.ASSESSMENT) {
          const examTime = moment.tz(examResponse.examDate, 'Asia/Calcutta').format('DD-MMM-YYYY H:mm:ss');
          this.notificationsService.createNotification({
            senderRole: user.role,
            senderId: user.userId,
            audience: NOTIFICATION_AUDIENCES.STUDENTS,
            isBatchNotification: true,
            to: <Types.ObjectId[]>(<unknown>examGenerationDTO.batchIds?.split(',')),
            message: `An Assessment has been scheduled by your teacher on ${examTime}`,
            examType: examGenerationDTO.examType,
            examId: examResponse._id,
            expiryAt: moment
              .tz(examGenerationDTO.examDate, 'Asia/Calcutta')
              .add(EXAM_BUFFER_TIME, 'minutes')
              .toDate(),
            type: NOTIFICATION_TYPES.EXAM_NOTIFICATION,
            notificationDate: moment.tz(examGenerationDTO.examDate, 'Asia/Calcutta').toDate(),
          });
        }

        return examResponse;
      }
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async generateWCLExam(user: any, examGenerationDTO: GenerateExamDTO): Promise<any> {
    try {
      const levelIds = examGenerationDTO.levelIds?.split(',');
      if (!levelIds || levelIds?.length === 0) {
        throw new HttpException('At-least one level must be selected', 400);
      }

      await Promise.all(
        levelIds.map(async levelId => {
          const levelDetails: LevelsModel = await this.levelsService.getLevelDetails(levelId);
          const newExam = {
            examType: examGenerationDTO.examType,
            examCategory: 'SIMPLE_ABACUS_EXAM',
            splitUps: levelDetails.splitUps,
            questions: generateAllQuestions(levelDetails.splitUps),
            name: examGenerationDTO.name,
            description: examGenerationDTO.description,
            examDate: examGenerationDTO.examDate ? moment.tz(examGenerationDTO.examDate, 'Asia/Calcutta').toDate() : undefined,
            duration: levelDetails.duration,
            resultDelay: examGenerationDTO.resultDelay,
            userId: user.userId,
          };
          const examResponse = await this.examModel.create(newExam);
          const examTime = moment.tz(examResponse.examDate, 'Asia/Calcutta').format('DD-MMM-YYYY H:mm:ss');
          this.notificationsService.createNotification({
            senderRole: user.role,
            senderId: user.userId,
            audience: NOTIFICATION_AUDIENCES.STUDENTS,
            to: [],
            toAll: true,
            message: `WCL has be scheduled by PRO ABACUS on ${examTime}`,
            examType: examGenerationDTO.examType,
            examId: examResponse._id,
            expiryAt: moment
              .tz(examGenerationDTO.examDate, 'Asia/Calcutta')
              .add(EXAM_BUFFER_TIME, 'minutes')
              .toDate(),
            type: NOTIFICATION_TYPES.EXAM_NOTIFICATION,
            notificationDate: moment.tz(examGenerationDTO.examDate, 'Asia/Calcutta').toDate(),
          });
        }),
      );
      return { message: 'WCL scheduled successfully' };
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async generateACLExam(user: any, examGenerationDTO: GenerateExamDTO): Promise<any> {
    try {
      const levelIds = examGenerationDTO.levelIds?.split(',');
      if (!levelIds || levelIds?.length === 0) {
        throw new HttpException('At-least one level must be selected', 400);
      }

      await Promise.all(
        levelIds.map(async levelId => {
          const levelDetails: LevelsModel = await this.levelsService.getLevelDetails(levelId);
          const newExam = {
            examType: examGenerationDTO.examType,
            examCategory: 'SIMPLE_ABACUS_EXAM',
            splitUps: levelDetails.splitUps,
            questions: generateAllQuestions(levelDetails.splitUps),
            name: examGenerationDTO.name,
            description: examGenerationDTO.description,
            examDate: examGenerationDTO.examDate ? moment.tz(examGenerationDTO.examDate, 'Asia/Calcutta').toDate() : undefined,
            duration: levelDetails.duration,
            resultDelay: examGenerationDTO.resultDelay,
            negativeMarks: examGenerationDTO.negativeMarks,
            skipQuestions: examGenerationDTO.skipQuestions,
            shuffleQuestions: examGenerationDTO.shuffleQuestions,
            userId: user.userId,
          };
          const examResponse = await this.examModel.create(newExam);
          const examTime = moment.tz(examResponse.examDate, 'Asia/Calcutta').format('DD-MMM-YYYY H:mm:ss');
          this.notificationsService.createNotification({
            senderRole: user.role,
            senderId: user.userId,
            audience: NOTIFICATION_AUDIENCES.STUDENTS,
            to: [],
            toAll: true,
            message: `ACL has be scheduled by PRO ABACUS on ${examTime}`,
            examType: examGenerationDTO.examType,
            examId: examResponse._id,
            expiryAt: moment
              .tz(examGenerationDTO.examDate, 'Asia/Calcutta')
              .add(EXAM_BUFFER_TIME, 'minutes')
              .toDate(),
            type: NOTIFICATION_TYPES.EXAM_NOTIFICATION,
            notificationDate: moment.tz(examGenerationDTO.examDate, 'Asia/Calcutta').toDate(),
          });
        }),
      );
      return { message: 'WCL scheduled successfully' };
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async startExam(user: any, examId: string): Promise<any> {
    try {
      const exam = await this.examModel.findOne({ _id: Types.ObjectId(examId) });
      if (!exam || exam.examStartedDateTime || exam.examCompletedDateTime)
        throw new HttpException('This exam is not available for you or already expired', 400);

      if (exam.examType === EXAM_TYPES.PRACTICE || exam.examType === EXAM_TYPES.SELF_TEST) {
        const userId = user.userId;
        if (exam.userId.toHexString() !== userId) {
          throw new HttpException('You are not allowed to write this exam', 400);
        }
      }

      if ([EXAM_TYPES.ASSESSMENT, EXAM_TYPES.WCL, EXAM_TYPES.ACL].includes(exam.examType)) {
        if (user.role !== ROLES.STUDENT) {
          throw new HttpException('You are not authorized to access this exam', 403);
        }

        // Ensure the student have access/eligibility to take exam
        const studentDetails = await this.studentsService.getStudentDetails({ studentId: user.userId });
        console.log(studentDetails);

        // Validate the exam date
        const examDateTime = moment.tz(exam.examDate, 'Asia/Calcutta');
        const currentDateTime = moment.tz('Asia/Calcutta');
        if (currentDateTime.isBefore(examDateTime)) {
          const timeDifference = examDateTime.diff(currentDateTime, 'minutes');
          if (timeDifference < 0) {
            throw new HttpException('The exam is already expired', 400);
          }
          throw new HttpException(
            {
              isExpired: false,
              startsIn: examDateTime.diff(currentDateTime, 'seconds'),
              message: 'The exam not available yet for you',
            },
            400,
          );
        }
      }

      // Once the exam is started, mark the exam as started
      // exam.examStartedDateTime = new Date();
      // await exam.save();

      return exam;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async completeExam(user: any, examId: string): Promise<any> {
    try {
      const exam = await this.examModel.findOne({ _id: Types.ObjectId(examId), userId: Types.ObjectId(user.userId) });
      if (!exam || exam.examStartedDateTime)
        throw new HttpException('This exam is not available for you to complete or already expired', 400);
      exam.examCompletedDateTime = new Date();
      await exam.save();
      return exam;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async captureAnswer(user: any, captureAnswerDTO: CaptureAnswerDTO): Promise<any> {
    try {
      const exam = await this.examModel.findOne({ userId: user.userId, _id: Types.ObjectId(captureAnswerDTO.examId) });
      if (!exam || exam.examCompletedDateTime) throw new HttpException('This exam is not available for you or already expired', 400);

      const question = exam.questions.find(question => question._id.toString() === captureAnswerDTO.questionId);

      const existingAnswer = await this.answerModel.findOne({ examId: exam._id, questionId: Types.ObjectId(captureAnswerDTO.questionId) });
      if (existingAnswer) throw new HttpException('This question is already answered', 400);

      const answer = {
        examId: exam._id,
        questionId: captureAnswerDTO.questionId,
        userId: user.userId,
        givenAnswer: parseFloat(captureAnswerDTO.answer),
        answer: question.answer,
        isCorrectAnswer: question.answer === parseFloat(captureAnswerDTO.answer),
        timeTaken: parseFloat('' + captureAnswerDTO.timeTaken),
      };
      this.answerModel.create(answer);
      return exam;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async examResult(user: any, examId: string): Promise<any> {
    try {
      const exams = await this.examModel.aggregate([
        {
          $match: {
            userId: Types.ObjectId(user.userId),
            _id: Types.ObjectId(examId),
          },
        },
        {
          $lookup: {
            from: 'answers',
            localField: '_id',
            foreignField: 'examId',
            as: 'answers',
          },
        },
      ]);
      const exam = exams?.[0];
      if (!exam || !exam?.examCompletedDateTime) throw new HttpException('This exam is not available or completed yet', 400);
      return exam;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error!');
    }
  }

  async getACLExamDetails(user: any, aclExamId: string): Promise<any> {
    try {
      const exam = await this.examModel.findOne({ _id: Types.ObjectId(aclExamId), examType: EXAM_TYPES.ACL });
      if (!exam) throw new HttpException('This exam is not available right now', 400);
      return {
        name: exam.name,
        description: exam.description,
        examDate: exam.examDate,
      };
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error!');
    }
  }
}
