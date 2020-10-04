import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MailService } from './mail.service';

@ApiBearerAuth()
@Controller('/api/mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('/')
  async setEmail(): Promise<any> {
    return this.mailService.sendMail({
      to: 'kalaivanan.muthusamy97@gmail.com',
      subject: 'Sending with SendGrid is Fun',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    });
  }
}
