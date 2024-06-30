import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaypalWebhookService } from './paypal-webhook.service';
import { ResponseWebHookPaypal } from 'src/types';

@Controller('paypal-webhook')
export class PaypalWebhookController {
  constructor(private readonly paypalWebhookService: PaypalWebhookService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers() headers: Record<string, string>,
    @Body() body: ResponseWebHookPaypal,
  ): Promise<{ success: true }> {
    try {
      await this.paypalWebhookService.handleWebhook(headers, body);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error handling PayPal webhook:', error.message);
      throw new InternalServerErrorException('Check log server');
    }
  }

  @Post('simulation-webhook')
  async webHookSimulation(): Promise<boolean> {
    return await this.paypalWebhookService.webHookSimulation();
  }
}
