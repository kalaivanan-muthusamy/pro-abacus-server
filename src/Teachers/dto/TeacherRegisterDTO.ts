import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from './../../Helpers/CustomValidators/IsNumberString';
import { Validate, IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class TeacherRegistrationDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly gender: 'Male' | 'Female';

  @ApiProperty()
  @IsNotEmpty()
  @Validate(IsNumberString)
  readonly age: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly centerName: string;
}
