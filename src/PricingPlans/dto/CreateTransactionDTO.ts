import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTransactionDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly pricingPlanId: string;
}
