import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class InviteToBatchDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly batchId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly studentEmailIds: string;
}
