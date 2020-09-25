import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BatchesSchema, BatchRequestsSchema } from './batches.schema';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';
import { TeachersModule } from './../Teachers/teachers.module';
import { NotificationsModule } from './../Notifications/notifications.module';
import { StudentsModule } from './../Students/students.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'batches', schema: BatchesSchema },
      { name: 'batchRequests', schema: BatchRequestsSchema },
    ]),
    forwardRef(() => TeachersModule),
    forwardRef(() => NotificationsModule),
    forwardRef(() => StudentsModule),
  ],
  controllers: [BatchesController],
  providers: [BatchesService],
  exports: [BatchesService],
})
export class BatchesModule {}
