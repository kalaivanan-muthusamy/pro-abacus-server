import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString } from './../../Helpers/CustomValidators/IsNumberString';
import { Validate, IsString, IsNotEmpty, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateStudentDTO {
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
  @MinLength(5)
  @MaxLength(20)
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
  readonly profileImage: any;
}
