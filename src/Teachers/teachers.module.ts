import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeachersSchema } from './teachers.schema';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { MailModule } from './../Mail/mail.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'teachers', schema: TeachersSchema }]), MailModule],
controllers: [TeachersController],
  providers: [TeachersService],
  exports: [MongooseModule, TeachersService],
})
export class TeachersModule {}
