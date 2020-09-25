import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsSchema } from './notifications.schema';
import { NotificationsService } from './notifications.service';
import { StudentsModule } from './../Students/students.module';
import { TeachersModule } from './../Teachers/teachers.module';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'notifications', schema: NotificationsSchema }]),
    forwardRef(() => StudentsModule),
    forwardRef(() => TeachersModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [MongooseModule, NotificationsService],
})
export class NotificationsModule {}
