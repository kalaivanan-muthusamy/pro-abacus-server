import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PricingPlansSchema, TransactionsSchema, SubscriptionHistorySchema } from './pricingplans.schema';
import { PricingController } from './pricingplans.controller';
import { PricingPlansService } from './pricingplans.service';
import { StudentsModule } from './../Students/students.module';
import { TeachersModule } from './../Teachers/teachers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'pricingplans', schema: PricingPlansSchema },
      { name: 'transactions', schema: TransactionsSchema },
      { name: 'subscription-history', schema: SubscriptionHistorySchema },
    ]),
    forwardRef(() => StudentsModule),
    forwardRef(() => TeachersModule),
  ],
  controllers: [PricingController],
  providers: [PricingPlansService],
  exports: [MongooseModule, PricingPlansService],
})
export class PricingPlansModule {}
