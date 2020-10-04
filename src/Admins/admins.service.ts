import { Injectable, HttpException, InternalServerErrorException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import * as bcyrpt from 'bcrypt';
import { AdminsModel } from './admins.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('admins')
    private adminModel: Model<AdminsModel>,
  ) {}

  async getAdminDetails({ adminId }): Promise<any> {
    try {
      const adminDetails = await this.adminModel.findOne({ _id: Types.ObjectId(adminId) }).lean();
      return adminDetails;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }

  async updateAdminDetails({ adminId, studentData, profileImage = null }): Promise<any> {
    try {
      const adminDetails: any = await this.adminModel.findOne({ _id: Types.ObjectId(adminId) });
      if (!adminDetails) throw new HttpException("Couldn't find the student details", 400);

      if (profileImage) {
        // Delete the existing profile image
        if (adminDetails.profileImage) {
          fs.unlink(adminDetails.profileImage, () => '');
        }
        adminDetails.profileImage = profileImage.path;
      }

      if (studentData?.batchId) {
        adminDetails.batchId = studentData?.batchId;
      }

      if (studentData?.name) {
        adminDetails.name = studentData?.name;
      }

      if (studentData?.email) {
        adminDetails.email = studentData?.email;
      }

      if (studentData?.password) {
        const encryptedPassword = bcyrpt.hashSync(studentData?.password, parseInt(process.env.PASSWORD_HASH_SALT_ROUND));
        adminDetails.password = encryptedPassword;
      }

      adminDetails.save();

      return adminDetails;
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }
}
