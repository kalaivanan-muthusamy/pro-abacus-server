import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LevelsModel } from './levels.schema';
import { NewLevelDTO } from './dto/NewLevelDTO';
import { UpdateLevelDTO } from './dto/UpdateLevelDTO';

@Injectable()
export class LevelsService {
  constructor(
    @InjectModel('levels')
    private readonly levelsModel: Model<LevelsModel>,
  ) {}

  async addNewLevel(newLevelDTO: NewLevelDTO): Promise<any> {
    try {
      const splitUps = JSON.parse(newLevelDTO.splitUps);
      const level = {
        name: newLevelDTO.name,
        splitUps: splitUps,
      };
      const newLevelResponse = await this.levelsModel.create(level);
      return newLevelResponse;
    } catch (err) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getAllLevels(): Promise<any> {
    try {
      const allLevels = await this.levelsModel.find({});
      return allLevels;
    } catch (err) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async updateLevel(updateLevelDTO: UpdateLevelDTO): Promise<any> {
    try {
      const levelDetails = await this.levelsModel.findOne({ _id: Types.ObjectId(updateLevelDTO.levelId) });
      if (updateLevelDTO.name) {
        levelDetails.name = updateLevelDTO.name;
      }
      if (updateLevelDTO.splitUps) {
        const splitUps = JSON.parse(updateLevelDTO.splitUps);
        levelDetails.splitUps = splitUps;
      }
      await levelDetails.save();
      return levelDetails;
    } catch (err) {
      throw new InternalServerErrorException('Internal server error', err);
    }
  }
}
