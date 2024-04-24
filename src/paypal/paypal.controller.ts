import { Controller, Get, Query } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { CancelOrder, PaypalQuery, type PaypalResponse } from 'src/types';

@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  @Get('capture-order')
  async captureOrder(@Query() query: PaypalQuery): Promise<PaypalResponse> {
    return await this.paypalService.captureOrder(query);
  }

  @Get('cancel-order')
  cancelOrder(): CancelOrder {
    return this.paypalService.cancelOrder();
  }
}
