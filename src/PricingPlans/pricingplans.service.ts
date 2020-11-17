/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable, HttpException, InternalServerErrorException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as Razorpay from 'razorpay';
import { PricingPlansModel, SubscriptionHistoryModel, TransactionsModel } from './pricingplans.schema';
import { NewPricingPlanDTO } from './dto/NewPricingPlanDTO';
import { UpdatePricingPlanDTO } from './dto/UpdatePricingPlanDTO';
import { InitiateSubscriptionDTO } from './dto/InitiateSubscriptionDTO';
import { APP_TIMEZONE } from 'src/configs';
import * as moment from 'moment-timezone';
import { CompletePaymentDTO } from './dto/CompletePaymentDTO';
import { ROLES } from 'src/constants';
import { TeachersService } from './../Teachers/teachers.service';
import { StudentsService } from './../Students/students.service';
import { CreateTransactionDTO } from './dto/CreateTransactionDTO';
import { CompleteExamPaymentDTO } from './../Exams/dto/CompleteExamPaymentDTO';
import { getMonthByNumber } from './../Helpers/Date/index';

@Injectable()
export class PricingPlansService {
  constructor(
    @InjectModel('pricingplans')
    private readonly pricingPlansModel: Model<PricingPlansModel>,
    @InjectModel('transactions')
    private readonly transactionsModel: Model<TransactionsModel>,
    @InjectModel('subscription-history')
    private readonly subscriptionHistoryModel: Model<SubscriptionHistoryModel>,
    @Inject(forwardRef(() => StudentsService))
    private readonly studentService: StudentsService,
    @Inject(forwardRef(() => TeachersService))
    private readonly teacherService: TeachersService,
  ) {}

  async addPricingPlan(newPricingPlanDTO: NewPricingPlanDTO): Promise<any> {
    try {
      // Multiple pricing plan must not exist for same exam type
      if (newPricingPlanDTO.examType) {
        const existing = await this.pricingPlansModel.findOne({ examType: newPricingPlanDTO.examType });
        if (existing) throw new HttpException('Pricing plan exists for similar exam type', 400);
      }

      const newSubscription = {
        name: newPricingPlanDTO.name,
        validity: newPricingPlanDTO.validity,
        basicPrice: newPricingPlanDTO.basicPrice,
        discountedPrice: newPricingPlanDTO.discountedPrice,
        examType: newPricingPlanDTO.examType,
        planType: newPricingPlanDTO.planType,
      };
      const newSubscriptionRes = await this.pricingPlansModel.create(newSubscription);
      return newSubscriptionRes;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getAllPricingPlans(planType: string): Promise<any> {
    try {
      const filter: any = {};
      if (planType) filter.planType = planType;
      const subscriptions = await this.pricingPlansModel.find(filter);
      return subscriptions;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async updatePricingPlan(updatePricingPlanDTO: UpdatePricingPlanDTO): Promise<any> {
    try {
      const pricingPlan = await this.pricingPlansModel.findOne({ _id: Types.ObjectId(updatePricingPlanDTO.pricingPlanId) });
      if (!pricingPlan) throw new HttpException('Pricing plan does not exist', 400);

      if (updatePricingPlanDTO.name !== undefined) {
        pricingPlan.name = updatePricingPlanDTO.name;
      }

      if (updatePricingPlanDTO.validity !== undefined) {
        pricingPlan.validity = updatePricingPlanDTO.validity;
      }

      if (updatePricingPlanDTO.basicPrice !== undefined) {
        pricingPlan.basicPrice = updatePricingPlanDTO.basicPrice;
      }

      if (updatePricingPlanDTO.discountedPrice !== undefined) {
        pricingPlan.discountedPrice = updatePricingPlanDTO.discountedPrice;
      }

      if (updatePricingPlanDTO.examType !== undefined) {
        pricingPlan.examType = updatePricingPlanDTO.examType;
      }

      await pricingPlan.save();
      return pricingPlan;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async initiatePaymentOrder(paymentAmount: number, currency = 'INR', receipt: string): Promise<any> {
    // Create a razropay order
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const orderResponse = await instance.orders.create({
      amount: paymentAmount * 100,
      currency,
      receipt,
    });

    return orderResponse;
  }

  async initiatePricingPlanPayment(initiateSubscriptionDTO: InitiateSubscriptionDTO, user: any): Promise<any> {
    try {
      const pricingPlanDetails = await this.pricingPlansModel.findOne({ _id: Types.ObjectId(initiateSubscriptionDTO.pricingPlanId) });
      if (!pricingPlanDetails) throw new HttpException('This plan not available currently', 400);

      const transaction = await this.transactionsModel.create({
        pricingPlanId: pricingPlanDetails._id,
        planType: pricingPlanDetails.planType,
        currency: pricingPlanDetails.currency,
        currencySymbol: pricingPlanDetails.currencySymbol,
        paymentAmount: pricingPlanDetails.discountedPrice,
        initiatedOn: moment.tz(APP_TIMEZONE).toDate(),
        userId: Types.ObjectId(user.userId),
        role: user.role,
      });

      const orderResponse = await this.initiatePaymentOrder(
        pricingPlanDetails.discountedPrice,
        pricingPlanDetails.currency,
        transaction?._id?.toHexString(),
      );

      return {
        orderId: orderResponse.id,
        transactionId: transaction._id,
      };
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async completePayment(completePaymentDTO: CompletePaymentDTO): Promise<any> {
    try {
      const transactionDetails: any = await this.transactionsModel
        .findOne({ _id: Types.ObjectId(completePaymentDTO.transactionId) })
        .populate('pricingPlanDetails');
      if (!transactionDetails) throw new HttpException('This transaction is not valid', 400);

      let userDetails;
      if (completePaymentDTO.paymentStatus === 'COMPLETED') {
        transactionDetails.paymentStatus = completePaymentDTO.paymentStatus;
        let fromDate;
        let expiryAt;
        if (transactionDetails.role === ROLES.STUDENT) {
          userDetails = await this.studentService.getStudentDetails({ studentId: transactionDetails.userId });
          fromDate = userDetails.subscriptionDetails?.expiryAt;
          if (userDetails.subscriptionDetails?.expiryAt) {
            expiryAt = moment
              .tz(userDetails.subscriptionDetails?.expiryAt, APP_TIMEZONE)
              .add(transactionDetails?.pricingPlanDetails?.validity, 'days')
              .toDate();
          } else {
            expiryAt = moment
              .tz(APP_TIMEZONE)
              .add(transactionDetails?.pricingPlanDetails?.validity, 'days')
              .toDate();
          }
          this.studentService.updateSubscriptionDetails({ studentId: userDetails._id, expiryAt });
        } else if (transactionDetails.role === ROLES.TEACHER) {
          userDetails = await this.teacherService.getTeacherDetails({ teacherId: transactionDetails.userId });
          fromDate = userDetails.subscriptionDetails?.expiryAt;
          if (userDetails.subscriptionDetails?.expiryAt) {
            expiryAt = moment
              .tz(userDetails.subscriptionDetails?.expiryAt, APP_TIMEZONE)
              .add(transactionDetails?.pricingPlanDetails?.validity, 'days')
              .toDate();
          } else {
            expiryAt = moment
              .tz(APP_TIMEZONE)
              .add(transactionDetails?.pricingPlanDetails?.validity, 'days')
              .toDate();
          }
          this.teacherService.updateSubscriptionDetails({ teacherId: userDetails._id, expiryAt });
        }

        transactionDetails.paymentStatus = completePaymentDTO.paymentStatus;
        transactionDetails.transactionDetails = {
          razorpayPaymentId: completePaymentDTO.razorpayPaymentId,
          razorpayOrderId: completePaymentDTO.razorpayOrderId,
          razorpaySignature: completePaymentDTO.razorpaySignature,
        };
        transactionDetails.save();

        await this.subscriptionHistoryModel.create({
          transactionId: transactionDetails._id,
          pricingPlanId: transactionDetails.pricingPlanId,
          userId: transactionDetails.userId,
          role: transactionDetails.role,
          fromDate: moment.tz(fromDate, APP_TIMEZONE).toDate(),
          toDate: expiryAt,
        });
      }
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async completeExamPayment(user: any, completeExamPaymentDTO: CompleteExamPaymentDTO): Promise<any> {
    try {
      const transactionDetails: any = await this.transactionsModel
        .findOne({ _id: Types.ObjectId(completeExamPaymentDTO.transactionId) })
        .populate('pricingPlanDetails');
      if (!transactionDetails) throw new HttpException('This transaction is not valid', 400);

      if (completeExamPaymentDTO.paymentStatus === 'COMPLETED') {
        transactionDetails.paymentStatus = completeExamPaymentDTO.paymentStatus;
        let userDetails;
        let fromDate;
        let expiryAt;
        if (transactionDetails.role === ROLES.STUDENT) {
          userDetails = await this.studentService.getStudentDetails({ studentId: transactionDetails.userId });
          fromDate = userDetails.subscriptionDetails?.expiryAt;
          if (userDetails.subscriptionDetails?.expiryAt) {
            expiryAt = moment
              .tz(userDetails.subscriptionDetails?.expiryAt, APP_TIMEZONE)
              .add(transactionDetails?.pricingPlanDetails?.validity, 'days')
              .toDate();
          } else {
            expiryAt = moment
              .tz(APP_TIMEZONE)
              .add(transactionDetails?.pricingPlanDetails?.validity, 'days')
              .toDate();
          }
          this.studentService.updateSubscriptionDetails({ studentId: userDetails._id, expiryAt });
        } else if (transactionDetails.role === ROLES.TEACHER) {
          userDetails = await this.teacherService.getTeacherDetails({ teacherId: transactionDetails.userId });
          fromDate = userDetails.subscriptionDetails?.expiryAt;
          if (userDetails.subscriptionDetails?.expiryAt) {
            expiryAt = moment
              .tz(userDetails.subscriptionDetails?.expiryAt, APP_TIMEZONE)
              .add(transactionDetails?.pricingPlanDetails?.validity, 'days')
              .toDate();
          } else {
            expiryAt = moment
              .tz(APP_TIMEZONE)
              .add(transactionDetails?.pricingPlanDetails?.validity, 'days')
              .toDate();
          }
          this.teacherService.updateSubscriptionDetails({ teacherId: userDetails._id, expiryAt });
        }

        transactionDetails.paymentStatus = completeExamPaymentDTO.paymentStatus;
        transactionDetails.transactionDetails = {
          razorpayPaymentId: completeExamPaymentDTO.razorpayPaymentId,
          razorpayOrderId: completeExamPaymentDTO.razorpayOrderId,
          razorpaySignature: completeExamPaymentDTO.razorpaySignature,
        };
        transactionDetails.save();
      }
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getSubscriptionHistories(userId: string): Promise<any> {
    try {
      const histories = await this.subscriptionHistoryModel
        .find({ userId: Types.ObjectId(userId) })
        .populate('pricingPlanDetails')
        .populate('transactionDetails');
      return histories;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async createTransaction(user: any, createTransactionDTO: CreateTransactionDTO): Promise<any> {
    try {
      const pricingDetails = await this.pricingPlansModel.findOne({ _id: Types.ObjectId(createTransactionDTO.pricingPlanId) });
      const newTransaction = await this.transactionsModel.create({
        pricingPlanId: Types.ObjectId(createTransactionDTO.pricingPlanId),
        initiatedOn: moment.tz(APP_TIMEZONE).toDate(),
        paymentAmount: pricingDetails.discountedPrice,
        planType: pricingDetails.planType,
        role: user.role,
        userId: Types.ObjectId(user.userId),
      });
      return newTransaction;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getSubscriptionTrend(role: string): Promise<any> {
    try {
      const startDate = moment.tz(APP_TIMEZONE);
      startDate.subtract(1, 'year');
      const subscriptionStats = [];
      const subscriptions = await this.subscriptionHistoryModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate.toDate() },
            role, 
          },
        },
        {
          $project: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
            createdAt: 1,
          },
        },
        {
          $group: {
            _id: { month: '$month', year: '$year' },
            createdAt: { $first: '$createdAt' },
            monthValue: { $first: '$month' },
            yearValue: { $first: '$year' },
            totalUsers: { $sum: 1 },
          },
        },
        { $sort: { createdAt: 1 } },
      ]);

      if (!subscriptions) throw new HttpException("Couldn't get the students joining trend data", 400);

      subscriptions.map(record => {
        subscriptionStats.push({
          key: `${getMonthByNumber(record.monthValue, false, 1)}, ${record.yearValue}`,
          value: record.totalUsers,
        });
      });

      console.debug(subscriptionStats);

      return {
        keys: subscriptionStats.map(trend => trend.key),
        values: subscriptionStats.map(trend => trend.value),
      };
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
