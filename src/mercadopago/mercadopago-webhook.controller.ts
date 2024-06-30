import { Body, Controller, Headers, Post, Query } from '@nestjs/common';
import { MercadopagoWebhookService } from './mercadopago-webhook.service';

@Controller('mercadopago')
export class MercadopagoWebhookController {
  constructor(
    private readonly mercadopagoWebhookService: MercadopagoWebhookService,
  ) {}

  @Post('webhook-mp')
  async handleWebhook(
    @Query() querys: any,
    @Body() body: any,
    @Headers() headers: any,
  ) {
    const hola = await this.mercadopagoWebhookService.handleWebhook(
      headers,
      body,
      querys,
    );
    console.log(hola);
  }
}
