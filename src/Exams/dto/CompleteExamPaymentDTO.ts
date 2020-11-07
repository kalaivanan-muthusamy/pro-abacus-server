import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteExamPaymentDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly transactionId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly razorpayPaymentId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly razorpayOrderId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly razorpaySignature: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly paymentStatus: string;
}
