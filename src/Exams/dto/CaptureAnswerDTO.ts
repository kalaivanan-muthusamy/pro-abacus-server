import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { IsNumberString } from './../../Helpers/CustomValidators/IsNumberString';

export class CaptureAnswerDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly examId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly questionId: string;

  @ApiProperty()
  @IsNotEmpty()
  @Validate(IsNumberString)
  readonly answer: string;

  @ApiProperty()
  @IsNotEmpty()
  @Validate(IsNumberString)
  readonly timeTaken: number;
}
