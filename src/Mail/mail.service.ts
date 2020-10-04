import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SendMailInterface } from './interface/SendMailInterface';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  async sendMail(emailContent: SendMailInterface): Promise<any> {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    try {
      const msg = {
        to: emailContent.to,
        from: 'proabacus2020@gmail.com',
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      };
      sgMail
        .send(msg)
        .then(() => {
          console.log('Email sent');
        })
        .catch(error => {
          console.error(error.response.body);
        });
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Internal Server Error!');
    }
  }
}
