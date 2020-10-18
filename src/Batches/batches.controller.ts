import { ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Post, SetMetadata, UseGuards, Body, Req, Get, Put, Query, Delete } from '@nestjs/common';
import { JwtAuthGuard } from './../AuthModule/jwt-auth.guard';
import { RolesGuard } from './../Helpers/CustomGaurds/roles.guard';
import { ROLES } from './../constants';
import { NewBatchDTO } from './dto/NewBatchDTO';
import { Request } from 'express';
import { BatchesService } from './batches.service';
import { JoinBatchDTO } from './dto/JoinBatchDTO';
import { SearchBatchDTO } from './dto/SearchBatchDTO';
import { AcceptBatchRequestDTO } from './dto/AcceptBatchRequestDTO';
import { UpdateBatchDTO } from './dto/UpdateBatchDTO';
import { InviteToBatchDTO } from './dto/InviteToBatchDTO';
import { DeleteStudentFromBatchDTO } from './dto/DeleteStudentFromBatchDTO';

@ApiBearerAuth()
@Controller('/api/batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get('/')
  @SetMetadata('roles', [ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllBatches(@Req() request: Request): Promise<any> {
    const user = request.user;
    return await this.batchesService.getAllBatches(user);
  }

  @Get('/students')
  @SetMetadata('roles', [ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getStudentsByBatch(@Query('batchId') batchId: string, @Req() request: Request): Promise<any> {
    const user = request.user;
    return await this.batchesService.getStudentsByBatch(user, batchId);
  }

  @Delete('/students')
  @SetMetadata('roles', [ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteStudentFromBatch(@Body() deleteStudentFromBatchDTO: DeleteStudentFromBatchDTO, @Req() request: Request): Promise<any> {
    const user = request.user;
    return await this.batchesService.deleteStudentFromBatch(user, deleteStudentFromBatchDTO);
  }

  @Post('/search')
  @SetMetadata('roles', [ROLES.STUDENT])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async searchBatches(@Body() searchBatchDTO: SearchBatchDTO): Promise<any> {
    return await this.batchesService.searchBatches(searchBatchDTO);
  }

  @Post('/invite')
  @SetMetadata('roles', [ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async inviteToBatch(@Req() request: Request, @Body() inviteToBatchDTO: InviteToBatchDTO): Promise<any> {
    const user = request.user;
    return await this.batchesService.inviteToBatch(user, inviteToBatchDTO);
  }

  @Post('/')
  @SetMetadata('roles', [ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createNewBatch(@Body() newBatchDTO: NewBatchDTO, @Req() request: Request): Promise<any> {
    const user = request.user;
    return await this.batchesService.createNewBatch(user, newBatchDTO);
  }

  @Put('/')
  @SetMetadata('roles', [ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateBatch(@Body() updateBatchDTO: UpdateBatchDTO, @Req() request: Request): Promise<any> {
    const user = request.user;
    return await this.batchesService.updateBatch(user, updateBatchDTO);
  }

  @Post('/join')
  @SetMetadata('roles', [ROLES.STUDENT])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async joinBatch(@Body() joinBatchDTO: JoinBatchDTO, @Req() request: Request): Promise<any> {
    const user = request.user;
    return await this.batchesService.joinBatchRequest(user, joinBatchDTO);
  }

  @Post('/request/update')
  @SetMetadata('roles', [ROLES.STUDENT, ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async acceptBatchRequest(@Body() acceptBatchRequestDTO: AcceptBatchRequestDTO, @Req() request: Request): Promise<any> {
    const user = request.user;
    return await this.batchesService.updateBatchRequest(user, acceptBatchRequestDTO);
  }
}
