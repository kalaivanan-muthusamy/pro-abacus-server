import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, Validate, ValidateIf } from 'class-validator';
import { IsNumberString } from '../../Helpers/CustomValidators/IsNumberString';
import { PRICING_PLAN_TYPES, EXAM_TYPES } from 'src/constants';

export class NewPricingPlanDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsIn([PRICING_PLAN_TYPES.SUBSCRIPTION, PRICING_PLAN_TYPES.EXAM_PLAN])
  readonly planType: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @ValidateIf(o => o.planType === PRICING_PLAN_TYPES.SUBSCRIPTION)
  @IsNotEmpty()
  @Validate(IsNumberString)
  readonly validity: number;

  @ApiProperty()
  @IsNotEmpty()
  @Validate(IsNumberString)
  readonly basicPrice: number;

  @ApiProperty()
  @IsNotEmpty()
  @Validate(IsNumberString)
  readonly discountedPrice: number;

  @ApiProperty()
  @ValidateIf(o => o.planType === PRICING_PLAN_TYPES.EXAM_PLAN)
  @IsNotEmpty()
  @IsIn([EXAM_TYPES.ACL])
  @IsString()
  readonly examType: string;
}
