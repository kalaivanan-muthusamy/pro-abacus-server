import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString } from './../../Helpers/CustomValidators/IsNumberString';
import { Validate, IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateTeacherDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  readonly email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly gender: 'Male' | 'Female';

  @ApiPropertyOptional()
  @IsOptional()
  @Validate(IsNumberString)
  readonly age: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly centerName: string;
}
