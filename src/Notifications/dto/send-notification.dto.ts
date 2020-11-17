import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendNotificationDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly to: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly message: string;
}
