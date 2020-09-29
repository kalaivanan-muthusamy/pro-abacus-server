import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsJSON, IsString, Validate } from 'class-validator';
import { IsNumberString } from './../../Helpers/CustomValidators/IsNumberString';

export class NewLevelDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsJSON()
  readonly splitUps: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Validate(IsNumberString)
  readonly duration: number;
}
