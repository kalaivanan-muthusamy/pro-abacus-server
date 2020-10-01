import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './AuthModule/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './Admins/admins.module';
import { StudentsModule } from './Students/students.module';
import { ExamModule } from './Exams/exams.module';
import { TeachersModule } from './Teachers/teachers.module';
import { BatchesModule } from './Batches/batches.module';
import { NotificationsModule } from './Notifications/notifications.module';
import { LevelsModule } from './Levels/levels.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    AuthModule,
    AdminModule,
    StudentsModule,
    ExamModule,
    TeachersModule,
    BatchesModule,
    NotificationsModule,
    LevelsModule,
  ],
})
export class AppModule {}