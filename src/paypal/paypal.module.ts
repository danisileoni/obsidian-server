import { Module, forwardRef } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { PaypalController } from './paypal.controller';
import { PaypalWebhookController } from './paypal-webhook.controller';
import { PaypalWebhookService } from './paypal-webhook.service';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  providers: [PaypalService, PaypalWebhookService],
  controllers: [PaypalController, PaypalWebhookController],
  imports: [forwardRef(() => PaymentsModule)],
  exports: [PaypalService],
})
export class PaypalModule {}
