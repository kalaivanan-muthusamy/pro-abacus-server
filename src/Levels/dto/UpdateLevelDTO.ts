import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsJSON, IsString, IsOptional, Validate } from 'class-validator';
import { IsNumberString } from './../../Helpers/CustomValidators/IsNumberString';

export class UpdateLevelDTO {
  @ApiProperty()
  @IsNotEmpty()
  readonly levelId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsJSON()
  readonly splitUps: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @Validate(IsNumberString)
  readonly duration: number;
}
