import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnswersSchema, ExamSchema, ResultsQueueSchema, ResultsSchema } from './exams.schema';
import { ExamController } from './exams.controller';
import { ExamService } from './exams.service';
import { StudentsModule } from './../Students/students.module';
import { NotificationsModule } from './../Notifications/notifications.module';
import { LevelsModule } from './../Levels/levels.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'exams', schema: ExamSchema },
      { name: 'answers', schema: AnswersSchema },
      { name: 'results', schema: ResultsSchema },
      { name: 'resultsQueue', schema: ResultsQueueSchema },
    ]),
    forwardRef(() => StudentsModule),
    NotificationsModule,
    LevelsModule,
  ],
  controllers: [ExamController],
  providers: [ExamService],
  exports: [ExamService],
})
export class ExamModule {}
