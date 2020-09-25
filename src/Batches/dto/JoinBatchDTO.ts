import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class JoinBatchDTO {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  readonly batchId: string;
}
