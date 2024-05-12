import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { type PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { PaymentMethodDto } from './dto/payment-method.dto';
import { PaypalService } from 'src/paypal/paypal.service';
import { PaypalQuery } from 'src/types';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paypalService: PaypalService,
  ) {}

  @Post('create/:id')
  @Auth()
  async create(
    @Param('id') idOrder: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return await this.paymentsService.create(createPaymentDto, idOrder);
  }

  @Get('capture-order-pp/:id')
  async captureOrderPaypal(
    @Query() query: PaypalQuery,
    @Param('id') id: string,
  ) {
    const captureOrder = await this.paypalService.captureOrder(query);

    return await this.paymentsService.assignedNewPayment(id, captureOrder);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Body() paymentMethodDto: PaymentMethodDto,
  ): Promise<PaymentResponse> {
    return await this.paymentsService.findOne(id, paymentMethodDto);
  }

  @Delete()
  async remove() {
    return 'hola';
  }
}
