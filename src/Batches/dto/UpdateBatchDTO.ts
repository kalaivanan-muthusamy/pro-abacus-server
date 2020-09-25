import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateBatchDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly batchId: string;

  @ApiProperty()
  @IsOptional()
  @MinLength(5)
  readonly name: string;

  @ApiProperty()
  @IsOptional()
  @MinLength(5)
  readonly description: string;
}
