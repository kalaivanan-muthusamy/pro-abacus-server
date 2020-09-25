import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsSchema } from './students.schema';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { BatchesModule } from './../Batches/batches.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'students', schema: StudentsSchema }]), forwardRef(() => BatchesModule)],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [MongooseModule, StudentsService],
})
export class StudentsModule {}
