import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type ItemEmailPaid } from 'src/types';

@Injectable()
export class MailsService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendConfirmPaid(
    mailUser: string,
    items: ItemEmailPaid[],
  ): Promise<void> {
    await this.mailerService.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to: [mailUser],
      subject: 'Aqui tienes tu compra! ObsidianDigitales',
      template: './send-confirm-paid',
      context: {
        items,
        date: new Date().getFullYear(),
      },
    });
  }
}
