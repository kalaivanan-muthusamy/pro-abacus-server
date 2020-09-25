import { Controller, Post, Body, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TeacherRegistrationDTO } from './dto/TeacherRegisterDTO';
import { TeachersService } from './teachers.service';
import { ROLES } from 'src/constants';
import { RolesGuard } from './../Helpers/CustomGaurds/roles.guard';
import { JwtAuthGuard } from './../AuthModule/jwt-auth.guard';

@ApiBearerAuth()
@Controller('/api/teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post('/')
  @SetMetadata('roles', [ROLES.TEACHER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async register(@Body() teacherRegistrationDTO: TeacherRegistrationDTO): Promise<any> {
    return this.teachersService.register(teacherRegistrationDTO);
  }
}
