/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Controller, Get, SetMetadata, UseGuards, Req, Put, UseInterceptors, Body, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admins.service';
import { ROLES } from './../constants';
import { RolesGuard } from './../Helpers/CustomGaurds/roles.guard';
import { JwtAuthGuard } from './../AuthModule/jwt-auth.guard';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { customFileName } from 'src/Helpers/File';
import { imageFileFilter } from './../Helpers/File/index';
import { UpdateAdminDTO } from './dto/UpdateAdminDTO';

@ApiBearerAuth()
@Controller('/api/admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/')
  @SetMetadata('roles', [ROLES.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getProfileDetails(@Req() request: Request): Promise<any> {
    const user: any = request.user;
    return this.adminService.getAdminDetails({ adminId: user.userId });
  }

  @Put('/')
  @SetMetadata('roles', [ROLES.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: 'uploads',
        filename: customFileName,
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 1000000 }, // 1MB
    }),
  )
  async updateProfile(@Req() request: Request, @Body() updateAdminDTO: UpdateAdminDTO, @UploadedFile() profileImage: any): Promise<any> {
    const user: any = request.user;
    return this.adminService.updateAdminDetails({ adminId: user.userId, studentData: updateAdminDTO, profileImage });
  }
}
