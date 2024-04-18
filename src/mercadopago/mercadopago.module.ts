import { Module } from '@nestjs/common';
import { MercadopagoService } from './mercadopago.service';
import { MercadopagoProvider } from './mercadopago.provider';

@Module({
  providers: [MercadopagoService, MercadopagoProvider],
  exports: [MercadopagoService, MercadopagoProvider],
})
export class MercadopagoModule {}
