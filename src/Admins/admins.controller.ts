import { Controller } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admins.service';

@ApiBearerAuth()
@Controller('/api/admins')
export class AdminController {
  constructor(private readonly restaurantService: AdminService) {}
}
