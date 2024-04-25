import { Controller, Get } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { CancelOrder } from 'src/types';

@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  @Get('cancel-order')
  cancelOrder(): CancelOrder {
    return this.paypalService.cancelOrder();
  }
}
