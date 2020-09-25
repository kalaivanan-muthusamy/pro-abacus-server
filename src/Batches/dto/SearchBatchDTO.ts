import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SearchBatchDTO {
  @IsNotEmpty()
  @ApiProperty()
  readonly searchText: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly exclude: string;
}
