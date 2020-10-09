import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsSchema } from './students.schema';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { BatchesModule } from './../Batches/batches.module';
import { MulterModule } from '@nestjs/platform-express';
import { MailModule } from './../Mail/mail.module';
import { ExamModule } from './../Exams/exams.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'students', schema: StudentsSchema }]),
    forwardRef(() => BatchesModule),
    forwardRef(() => ExamModule),
    MailModule,
    MulterModule.register({
      dest: '/uploads',
    }),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [MongooseModule, StudentsService],
})
export class StudentsModule {}
