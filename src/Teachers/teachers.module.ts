import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeachersSchema } from './teachers.schema';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'teachers', schema: TeachersSchema }])],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [MongooseModule, TeachersService],
})
export class TeachersModule {}
