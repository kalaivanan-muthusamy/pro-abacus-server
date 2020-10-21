import { ApiBearerAuth } from '@nestjs/swagger';
import { Body, Controller, Get, Post, Put, Query, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { NewPricingPlanDTO } from './dto/NewPricingPlanDTO';
import { PricingPlansService } from './pricingplans.service';
import { UpdatePricingPlanDTO } from './dto/UpdatePricingPlanDTO';
import { ROLES } from './../constants';
import { JwtAuthGuard } from './../AuthModule/jwt-auth.guard';
import { RolesGuard } from './../Helpers/CustomGaurds/roles.guard';
import { InitiateSubscriptionDTO } from './dto/InitiateSubscriptionDTO';
import { Request } from 'express';
import { CompletePaymentDTO } from './dto/CompletePaymentDTO';

@ApiBearerAuth()
@Controller('/api/pricing-plans')
export class PricingController {
  constructor(private readonly pricingPlansService: PricingPlansService) {}

  @Get('/')
  async getAllPricingPlans(@Query('planType') planType: string): Promise<any> {
    return this.pricingPlansService.getAllPricingPlans(planType);
  }

  @Post('/')
  @SetMetadata('roles', [ROLES.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addPricingPlan(@Body() newPricingPlanDTO: NewPricingPlanDTO): Promise<any> {
    return this.pricingPlansService.addPricingPlan(newPricingPlanDTO);
  }

  @Put('/')
  @SetMetadata('roles', [ROLES.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updatePricingPlan(@Body() updatePricingPlanDTO: UpdatePricingPlanDTO): Promise<any> {
    return this.pricingPlansService.updatePricingPlan(updatePricingPlanDTO);
  }

  @Post('/initiate-payment')
  @SetMetadata('roles', [ROLES.STUDENT, ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async initiatePricingPlanPayment(@Body() initiateSubscriptionDTO: InitiateSubscriptionDTO, @Req() request: Request): Promise<any> {
    const user = request.user;
    return this.pricingPlansService.initiatePricingPlanPayment(initiateSubscriptionDTO, user);
  }

  @Post('/complete-payment')
  // @SetMetadata('roles', [ROLES.ADMIN])
  // @UseGuards(JwtAuthGuard, RolesGuard)
  async completePayment(@Body() completePaymentDTO: CompletePaymentDTO): Promise<any> {
    return this.pricingPlansService.completePayment(completePaymentDTO);
  }

  @Get('/subscription-history')
  @SetMetadata('roles', [ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getSubscriptionHistories(@Query('userId') userId: string, @Req() request: Request): Promise<any> {
    const user: any = request.user;
    let subscriberId = user.userId;
    if (user.role === ROLES.ADMIN) {
      subscriberId = userId;
    }
    return this.pricingPlansService.getSubscriptionHistories(subscriberId);
  }
}
