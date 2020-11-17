import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SendMailInterface } from './interface/SendMailInterface';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  async sendMail(emailContent: SendMailInterface): Promise<any> {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.in',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: 'support@proabacus.com',
          pass: 'ProAbacus@123##',
        },
      });
      const msg = {
        to: emailContent.to,
        from: 'support@proabacus.com',
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      };
      const emailRes = await transporter.sendMail(msg);
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }
}
