import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString } from './../../Helpers/CustomValidators/IsNumberString';
import { Validate, IsString, IsEmail, IsOptional, IsDateString, IsBoolean } from 'class-validator';

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  readonly enabled: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly teacherId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({ message: 'Exam date should be provided' })
  readonly expiryAt: string;
}
