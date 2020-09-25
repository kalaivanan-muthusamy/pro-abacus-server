import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsJSON, IsString, Validate, IsOptional } from 'class-validator';
import { IsNumberString } from './../../Helpers/CustomValidators/IsNumberString';

export class GenerateExamDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsJSON()
  readonly splitUps: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly examType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Validate(IsNumberString)
  readonly duration: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly description: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly examDate: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly batchIds: string;
}
