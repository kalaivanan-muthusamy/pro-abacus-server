import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CompletePaymentDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly transactionId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly paymentStatus: string;
}
