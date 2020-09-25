import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admins.controller';
import { AdminService } from './admins.service';
import { AdminsSchema } from './admins.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'admins', schema: AdminsSchema }])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [MongooseModule],
})
export class AdminModule {}
