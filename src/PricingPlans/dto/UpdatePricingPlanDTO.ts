import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate, IsOptional } from 'class-validator';
import { IsNumberString } from '../../Helpers/CustomValidators/IsNumberString';

export class UpdatePricingPlanDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly pricingPlanId: string;
  
  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsOptional()
  @Validate(IsNumberString)
  readonly validity: number;

  @ApiProperty()
  @IsOptional()
  @Validate(IsNumberString)
  readonly basicPrice: number;

  @ApiProperty()
  @IsOptional()
  @Validate(IsNumberString)
  readonly discountedPrice: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly examType: string;
}
