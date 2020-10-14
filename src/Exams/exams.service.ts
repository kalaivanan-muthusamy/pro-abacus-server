/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { HttpException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment-timezone';
import { ExamModel, AnswersModel } from './exams.schema';
import { GenerateExamDTO } from './dto/GenerateExamDTO';
import { generateAllQuestions } from './helpers/GenerateQuestions';
import { CaptureAnswerDTO } from './dto/CaptureAnswerDTO';
import { EXAM_TYPES, NOTIFICATION_TYPES } from 'src/constants';
import { ROLES } from './../constants';
import { StudentsService } from './../Students/students.service';
import { NotificationsService } from './../Notifications/notifications.service';
import { NOTIFICATION_AUDIENCES } from './../constants';
import { APP_TIMEZONE, EXAM_BUFFER_TIME } from './../configs';
import { LevelsService } from './../Levels/levels.service';
import { LevelsModel } from 'src/Levels/levels.schema';
import { forwardRef } from '@nestjs/common';
import {
  getAverageSpeed,
  getAverageAccuracy,
  getAverageDuration,
  getAverageDurationFromResult,
  getAverageSpeedFromResult,
} from './exams.helper';
import { ResultsQueueModel } from './exams.schema';
import { RESULT_QUEUE_STATUS } from './../constants';
import { ResultsModel } from './exams.schema';
import { getScoredMarks } from './helpers/GetScoredMarks';
import { getFormattedNumber } from './../Helpers/Math/index';
import { getAverageAccuracyFromResult } from './exams.helper';

@Injectable()
export class ExamService {
  constructor(
    @InjectModel('exams')
    private readonly examModel: Model<ExamModel>,
    @InjectModel('answers')
    private readonly answersModel: Model<AnswersModel>,
    @InjectModel('results')
    private readonly resultsModel: Model<ResultsModel>,
    @InjectModel('resultsQueue')
    private readonly resultsQueueModel: Model<ResultsQueueModel>,
    @Inject(forwardRef(() => StudentsService))
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
          // TODO - To be removed?
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
            levelId: levelDetails._id,
            questions: generateAllQuestions(levelDetails.splitUps),
            name: examGenerationDTO.name,
            description: examGenerationDTO.description,
            examDate: moment.tz(examGenerationDTO.examDate, 'Asia/Calcutta').toDate(),
            duration: levelDetails.duration,
            resultDelay: examGenerationDTO.resultDelay,
            userId: user.userId,
          };
          const examResponse = await this.examModel.create(newExam);

          // Create notification
          const examTime = moment.tz(examResponse.examDate, 'Asia/Calcutta').format('DD-MMM-YYYY H:mm:ss');
          this.notificationsService.createNotification({
            senderRole: user.role,
            senderId: user.userId,
            audience: NOTIFICATION_AUDIENCES.STUDENTS,
            to: [levelDetails._id],
            toAll: false,
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

          // Schedule result preparation queue
          const resultPreparationTime = moment
            .tz(examResponse.examDate, 'Asia/Calcutta')
            .add(examResponse.duration, 'minutes')
            .add(EXAM_BUFFER_TIME + 3, 'minutes');
          await this.resultsQueueModel.create({
            examId: examResponse._id,
            preparationTime: resultPreparationTime.toDate(),
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
            questions: generateAllQuestions(levelDetails.splitUps, examGenerationDTO.negativeMarks),
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

          // Create notification
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

          // Schedule result preparation
          const resultPreparationTime = moment
            .tz(examResponse.examDate, 'Asia/Calcutta')
            .add(examResponse.duration, 'minutes')
            .add(EXAM_BUFFER_TIME + 3, 'minutes');
          await this.resultsQueueModel.create({
            examId: examResponse._id,
            preparationTime: resultPreparationTime.toDate(),
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
      if (!exam) throw new HttpException('This exam is not available', 400);

      // TODO
      if (exam.examType === EXAM_TYPES.PRACTICE || exam.examType === EXAM_TYPES.SELF_TEST) {
        if (exam.examStartedDateTime || exam.examCompletedDateTime)
          throw new HttpException('This exam is not available for you or already expired', 400);
        const userId = user.userId;
        if (exam.userId.toHexString() !== userId) {
          throw new HttpException('You are not allowed to write this exam', 400);
        }
      }

      if ([EXAM_TYPES.ASSESSMENT, EXAM_TYPES.WCL, EXAM_TYPES.ACL].includes(exam.examType)) {
        if (user.role !== ROLES.STUDENT) {
          throw new HttpException('You are not authorized to access this exam', 403);
        }

        // TODO - Ensure the student have access/eligibility to take exam
        const studentDetails = await this.studentsService.getStudentDetails({ studentId: user.userId });
        // console.log(studentDetails);

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

      // Once exam is started, check and create an entry in Answers collection
      const existingExamAnswers = await this.answersModel.findOne({ examId: exam._id, userId: Types.ObjectId(user.userId) });
      if (existingExamAnswers) {
        throw new HttpException("This exam can't be started", 400);
      }

      await this.answersModel.create({
        userId: user.userId,
        examId: exam._id,
        examType: exam.examType,
        examStartedOn: moment.tz('Asia/Calcutta').toDate(),
        answers: [],
      });

      return exam;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async completeExam(user: any, examId: string): Promise<any> {
    try {
      const exam = await this.examModel.findOne({ _id: Types.ObjectId(examId) });
      if (!exam) throw new HttpException('This exam is not available for you to complete or already expired', 400);

      const answers = await this.answersModel.findOne({ examId: Types.ObjectId(examId), userId: Types.ObjectId(user.userId) });
      if (!answers) throw new HttpException('This exam is not available for you to complete or already expired', 400);

      answers.examCompletedOn = moment.tz('Asia/Calcutta').toDate();
      await answers.save();
      return exam;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async captureAnswer(user: any, captureAnswerDTO: CaptureAnswerDTO): Promise<any> {
    try {
      const exam = await this.examModel.findOne({ _id: Types.ObjectId(captureAnswerDTO.examId) });
      if (!exam || exam.examCompletedDateTime) throw new HttpException('This exam is not available for you or already expired', 400);

      const question = exam.questions.find(question => question._id.toString() === captureAnswerDTO.questionId);

      const existingAnswers = await this.answersModel.findOne({ examId: exam._id, userId: Types.ObjectId(user.userId) });
      if (!existingAnswers) throw new HttpException("This question can't be answered since the exam is not started", 400);

      const isAnswerExist = existingAnswers?.answers?.find(answers => answers.questionId.toHexString() === captureAnswerDTO.questionId);
      if (isAnswerExist) throw new HttpException('This question is already answered', 400);

      const answer = {
        questionId: Types.ObjectId(captureAnswerDTO.questionId),
        givenAnswer: parseFloat(captureAnswerDTO.answer),
        answer: question.answer,
        isCorrectAnswer: question.answer === parseFloat(captureAnswerDTO.answer),
        timeTaken: parseFloat('' + captureAnswerDTO.timeTaken),
      };
      existingAnswers.answers = [...existingAnswers.answers, answer];
      await existingAnswers.save();
      return exam;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async examResult(user: any, examId: string): Promise<any> {
    try {
      const examDetails = await this.examModel.findOne({ _id: Types.ObjectId(examId) }).lean();
      if (!examDetails) throw new HttpException('This exam is not available', 400);

      const answers = await this.answersModel.findOne({ examId: Types.ObjectId(examId), userId: Types.ObjectId(user.userId) });
      if (!answers) throw new HttpException('This exam is not available', 400);

      if (!answers.examStartedOn || !answers.examCompletedOn) {
        throw new HttpException("Results can't be viewed for this account currently", 400);
      }

      return { ...examDetails, answers };
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

  async getExamReports({ userId }): Promise<any> {
    try {
      const examsCompleted = await this.answersModel
        .find({
          userId: Types.ObjectId(userId),
          examCompletedOn: { $exists: true },
        })
        .populate('examDetails');

      const ACLExamResults: any = await this.resultsModel.find({ userId: Types.ObjectId(userId), examType: EXAM_TYPES.ACL });
      const ACLExams = {
        exams: ACLExamResults,
        participated: ACLExamResults?.length,
        avgSpeed: getAverageSpeedFromResult(ACLExamResults),
        avgAccuracy: getAverageAccuracyFromResult(ACLExamResults),
        avgDuration: getAverageDurationFromResult(ACLExamResults),
        totalStars: ACLExamResults?.filter?.(result => result.isACLStar).length,
      };

      const WCLExamResults: any = await this.resultsModel.find({ userId: Types.ObjectId(userId), examType: EXAM_TYPES.WCL });
      const WCLExams = {
        exams: WCLExamResults,
        participated: WCLExamResults?.length,
        avgSpeed: getAverageSpeedFromResult(WCLExamResults),
        avgAccuracy: getAverageAccuracyFromResult(WCLExamResults),
        avgDuration: getAverageDurationFromResult(WCLExamResults),
        totalStars: WCLExamResults?.filter?.(result => result.isWCLStar).length,
      };

      let PracticeExams: any = examsCompleted.filter(exam => exam.examType === EXAM_TYPES.PRACTICE);
      PracticeExams = {
        exams: PracticeExams,
        participated: PracticeExams?.length,
        avgSpeed: getAverageSpeed(PracticeExams),
        avgAccuracy: getAverageAccuracy(PracticeExams),
        avgDuration: getAverageDuration(PracticeExams),
        totalStars: 0,
      };

      let AssessmentExams: any = examsCompleted.filter(exam => exam.examType === EXAM_TYPES.ASSESSMENT);
      AssessmentExams = {
        exams: AssessmentExams,
        participated: AssessmentExams?.length,
        avgSpeed: getAverageSpeed(AssessmentExams),
        avgAccuracy: getAverageAccuracy(AssessmentExams),
        avgDuration: getAverageDuration(AssessmentExams),
        totalStars: 0,
      };

      let SelfTestExams: any = examsCompleted.filter(exam => exam.examType === EXAM_TYPES.SELF_TEST);
      SelfTestExams = {
        exams: SelfTestExams,
        participated: SelfTestExams?.length,
        avgSpeed: getAverageSpeed(SelfTestExams),
        avgAccuracy: getAverageAccuracy(SelfTestExams),
        avgDuration: getAverageDuration(SelfTestExams),
        totalStars: 0,
      };

      return {
        ACLExams,
        WCLExams,
        PracticeExams,
        AssessmentExams,
        SelfTestExams,
      };
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error!');
    }
  }

  async getCompletedExamDetails(examType: string, user: any): Promise<any> {
    try {
      const filter: any = { examType, isCompleted: true };
      if (user.role === ROLES.STUDENT) {
        const studentDetails = await this.studentsService.getStudentDetails({ studentId: user.userId });
        filter.levelId = studentDetails.levelId;
      }
      const examDetails = this.examModel.find(filter).select('_id name description examDate duration');
      return examDetails;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error!');
    }
  }

  async getRecentWCLReport(user: any): Promise<any> {
    try {
      const studentDetails = await this.studentsService.getStudentDetails({ studentId: user.userId });
      const latestWCLExams = await this.examModel
        .find({ examType: EXAM_TYPES.WCL, isCompleted: true, levelId: studentDetails.levelId })
        .select('_id name description examDate duration')
        .sort({ examDate: -1 })
        .limit(1);
      const recentWCLExam = latestWCLExams?.[0];
      const examDetails = await this.getExamResults(recentWCLExam._id, '10');
      return examDetails;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error!');
    }
  }

  async getExamResults(examId: string, limit: string): Promise<any> {
    try {
      const resultLimit = limit === 'ALL' ? 100 : parseInt(limit);
      const examResults = this.resultsModel
        .find({ examId: Types.ObjectId(examId) })
        .populate('studentDetails', 'name')
        .populate('examDetails', 'name')
        .limit(resultLimit);
      return examResults;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error!');
    }
  }

  async getWCLStarDetails(user: any): Promise<any> {
    try {
      const userDetails = await this.studentsService.getStudentDetails({ studentId: user.userId });
      const latestWCLExams = await this.examModel
        .find({ examType: EXAM_TYPES.WCL, isCompleted: true, levelId: userDetails.levelId })
        .sort({ examDate: -1 })
        .limit(1);
      if (!latestWCLExams || latestWCLExams.length === 0) {
        return {};
      }
      const latestWCLExam = latestWCLExams[0];

      const wclStarResult = await this.resultsModel.findOne({ examId: latestWCLExam._id, rank: 1 }).populate('examDetails', 'name');
      const studentDetails = await this.studentsService.getStudentDetails({ studentId: wclStarResult.userId });

      return {
        studentDetails: {
          name: studentDetails.name,
          profileImage: studentDetails.profileImage,
          level: studentDetails?.levelDetails?.name,
        },
        result: wclStarResult,
      };
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error!');
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS) // '0 */2 * * * *'
  async resultPreparationCron(): Promise<void> {
    const currentTime = moment.tz(APP_TIMEZONE);
    const examsForResultPreparation = await this.resultsQueueModel.find({
      status: RESULT_QUEUE_STATUS.NOT_PREPARED,
      preparationTime: { $lte: currentTime.toDate() },
    });
    examsForResultPreparation.map(async examForResultPreparation => {
      const attendees = await this.answersModel.find({
        examId: examForResultPreparation.examId,
        examCompletedOn: { $exists: true },
      });
      const examDetails = await this.examModel.findOne({ _id: examForResultPreparation.examId });

      const existingResult = await this.resultsModel.findOne({ examId: examDetails._id });
      if (existingResult) return;

      // Finding total marks
      let totalMarks = 0;
      let totalQuestions = 0;
      Object.values(examDetails.splitUps).map(splitUps => {
        splitUps.map(splitUp => {
          totalMarks += splitUp?.questions * splitUp?.marks || 0;
          totalQuestions += splitUp?.questions || 0;
        });
      });

      let resultsArray = [];

      attendees.map(examAnswers => {
        const answeredQuestions = examAnswers?.answers?.length;
        const correctAnswers = examAnswers?.answers?.filter?.(answer => answer?.isCorrectAnswer)?.length || 0;
        const inCorrectAnswers = answeredQuestions - correctAnswers;
        const scoredMarks = getScoredMarks(examDetails, examAnswers);
        const timeTaken = getFormattedNumber(
          examAnswers?.answers?.reduce?.((acc, cur) => cur.timeTaken + acc, 0),
          0,
        );
        const speed = parseFloat(((answeredQuestions / timeTaken) * 60).toFixed(2));
        const result = {
          examId: examDetails._id,
          examType: examDetails.examType,
          userId: examAnswers.userId,
          totalQuestions: totalQuestions,
          totalMarks: totalMarks,
          accuracy: parseFloat(((correctAnswers / totalQuestions) * 100).toFixed(2)),
          answeredQuestions,
          correctAnswers,
          inCorrectAnswers,
          timeTaken: timeTaken,
          percentile: 0,
          rank: 0,
          scoredMarks,
          speed,
        };
        resultsArray.push(result);
      });

      // Update the percentile
      resultsArray.map((result, index) => {
        let percentile = 0;
        const noOfAttendeesBehindOrEqual = resultsArray.filter((r, i) => i !== index && r.scoredMarks <= result.scoredMarks).length;
        percentile = parseFloat(((noOfAttendeesBehindOrEqual / resultsArray.length) * 100).toFixed(2));
        result.percentile = percentile;
      });

      // Update the rank
      resultsArray = resultsArray.sort((a, b) => (a.percentile > b.percentile ? -1 : 1));
      resultsArray.map((result, index) => {
        const rank = index + 1;
        result.rank = rank;
        if (examDetails.examType === EXAM_TYPES.WCL && rank === 1) {
          result.isWCLStar = true;
        }
        if (examDetails.examType === EXAM_TYPES.ACL && [1, 2, 3].includes(rank)) {
          result.isACLStar = true;
        }
      });

      this.resultsModel.insertMany(resultsArray);
      await this.resultsQueueModel.updateOne({ examId: examForResultPreparation.examId }, { status: RESULT_QUEUE_STATUS.COMPLETED });
      examDetails.isCompleted = true;
      examDetails.save();
    });
  }
}
