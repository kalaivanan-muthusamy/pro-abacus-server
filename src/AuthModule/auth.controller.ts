import { Controller, Body, Post, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticationDTO } from './dto/AuthenticationDTO';
import { ApiResponse } from '@nestjs/swagger';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiResponse({
    status: 400,
    type: BadRequestException,
  })
  async doAuthentication(@Body() authenticationDTO: AuthenticationDTO): Promise<any> {
    const result = await this.authService.doAuthentication(authenticationDTO);
    return result;
  }
}
