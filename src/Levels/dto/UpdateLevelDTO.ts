import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsJSON, IsString, IsOptional } from 'class-validator';

export class UpdateLevelDTO {
  @ApiProperty()
  @IsNotEmpty()
  readonly levelId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsJSON()
  readonly splitUps: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly name: string;
}
