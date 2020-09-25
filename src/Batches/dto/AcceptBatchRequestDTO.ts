import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptBatchRequestDTO {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  readonly batchRequestId: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  readonly status: string;
}
