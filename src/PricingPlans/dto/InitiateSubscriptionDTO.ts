import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class InitiateSubscriptionDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly pricingPlanId: string;
}
