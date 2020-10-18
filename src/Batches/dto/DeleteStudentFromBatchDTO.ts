import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteStudentFromBatchDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly batchId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly studentId: string;
}
