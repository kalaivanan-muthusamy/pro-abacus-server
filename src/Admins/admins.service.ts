import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AdminsModel } from './admins.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('admins')
    private adminModel: Model<AdminsModel>,
  ) {}
}
