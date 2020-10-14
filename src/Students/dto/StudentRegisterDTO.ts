import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from './../../Helpers/CustomValidators/IsNumberString';
import { Validate, IsString, IsNotEmpty, IsEmail, MinLength, MaxLength } from 'class-validator';

export class StudentRegisterDTO {
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
  @MinLength(5)
  @MaxLength(20)
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
  readonly levelId: string;
}
