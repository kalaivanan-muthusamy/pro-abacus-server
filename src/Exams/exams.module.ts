import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnswerSchema, ExamSchema } from './exams.schema';
import { ExamController } from './exams.controller';
import { ExamService } from './exams.service';
import { StudentsModule } from './../Students/students.module';
import { NotificationsModule } from './../Notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'exams', schema: ExamSchema },
      { name: 'answers', schema: AnswerSchema },
    ]),
    StudentsModule,
    NotificationsModule,
  ],
  controllers: [ExamController],
  providers: [ExamService],
})
export class ExamModule {}
