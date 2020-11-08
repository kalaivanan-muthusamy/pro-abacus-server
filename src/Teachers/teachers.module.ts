import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeachersSchema } from './teachers.schema';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { MailModule } from './../Mail/mail.module';
import { BatchesModule } from './../Batches/batches.module';
import { StudentsModule } from './../Students/students.module';
import { ExamModule } from './../Exams/exams.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'teachers', schema: TeachersSchema }]),
    MailModule,
    forwardRef(() => BatchesModule),
    forwardRef(() => StudentsModule),
    forwardRef(() => ExamModule),
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [MongooseModule, TeachersService],
})
export class TeachersModule {}
