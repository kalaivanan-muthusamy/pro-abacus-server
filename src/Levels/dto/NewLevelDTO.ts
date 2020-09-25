import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsJSON, IsString } from 'class-validator';

export class NewLevelDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsJSON()
  readonly splitUps: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;
}
