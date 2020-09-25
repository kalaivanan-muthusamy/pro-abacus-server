import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LevelsSchema } from './levels.schema';
import { LevelsController } from './levels.controller';
import { LevelsService } from './levels.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'levels', schema: LevelsSchema }])],
  controllers: [LevelsController],
  providers: [LevelsService],
})
export class LevelsModule {}
