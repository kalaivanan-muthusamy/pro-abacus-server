import { Controller, Post, Body, SetMetadata, UseGuards, Get, Put } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ROLES } from 'src/constants';
import { RolesGuard } from './../Helpers/CustomGaurds/roles.guard';
import { JwtAuthGuard } from './../AuthModule/jwt-auth.guard';
import { LevelsService } from './levels.service';
import { NewLevelDTO } from './dto/NewLevelDTO';
import { UpdateLevelDTO } from './dto/UpdateLevelDTO';

@ApiBearerAuth()
@Controller('/api/levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Post('/')
  @SetMetadata('roles', [ROLES.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addNewLevel(@Body() newLevelDTO: NewLevelDTO): Promise<any> {
    return this.levelsService.addNewLevel(newLevelDTO);
  }

  @Get('/')
  async getAllLevels(): Promise<any> {
    return this.levelsService.getAllLevels();
  }

  @Put('/')
  @SetMetadata('roles', [ROLES.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateLevels(@Body() updateLevelDTO: UpdateLevelDTO): Promise<any> {
    return this.levelsService.updateLevel(updateLevelDTO);
  }
}
