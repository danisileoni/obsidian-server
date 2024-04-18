import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MercadopagoModule } from 'src/mercadopago/mercadopago.module';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [MercadopagoModule],
})
export class PaymentsModule {}
