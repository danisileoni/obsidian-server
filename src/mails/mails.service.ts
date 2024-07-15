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
      subject: 'Aqui tienes tu compra! QuaraStore',
      template: './send-confirm-paid',
      context: {
        items,
        date: new Date().getFullYear(),
      },
    });
  }

  async sendMissingAccounts(
    items: Array<{
      id: number;
      title: string;
      typeAccount: string;
      userEmail: string;
    }>,
  ): Promise<void> {
    await this.mailerService.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to: ['quarastorecontact@gmail.com'],
      subject: 'Juegos a enviar!',
      template: './send-missing-accounts',
      context: {
        items,
        date: new Date().getFullYear(),
      },
    });
  }

  async sendForgotPassword({
    mailUser,
    token,
    name,
  }: {
    mailUser: string;
    token: string;
    name: string;
  }): Promise<void> {
    const resetLink = `${this.configService.get('HOST_FRONT')}/auth/forgot-password/${token}`;

    await this.mailerService.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to: [mailUser],
      subject: 'Recuperación de contraseña! QuaraStore',
      template: './send-forgot-password',
      context: {
        name,
        resetLink,
        date: new Date().getFullYear(),
      },
    });
  }
}
