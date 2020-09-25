import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class NewBatchDTO {
  @IsNotEmpty()
  @ApiProperty()
  @MinLength(5)
  readonly name: string;

  @IsNotEmpty()
  @ApiProperty()
  @MinLength(5)
  readonly description: string;
}
