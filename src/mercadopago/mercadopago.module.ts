import { Module, forwardRef } from '@nestjs/common';
import { MercadopagoService } from './mercadopago.service';
import { MercadopagoProvider } from './mercadopago.provider';
import { MercadopagoWebhookController } from './mercadopago-webhook.controller';
import { MercadopagoWebhookService } from './mercadopago-webhook.service';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  providers: [
    MercadopagoService,
    MercadopagoProvider,
    MercadopagoWebhookService,
  ],
  exports: [MercadopagoService, MercadopagoProvider],
  imports: [forwardRef(() => PaymentsModule)],
  controllers: [MercadopagoWebhookController],
})
export class MercadopagoModule {}
