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
import { PaypalService } from 'src/paypal/paypal.service';
import {
  type PaypalCaptureResponse,
  PaypalQuery,
  type PaypalResponse,
} from 'src/types';
import { type Payment } from './entities/payment.entity';

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
  ): Promise<PaymentResponse | PaypalResponse> {
    return await this.paymentsService.create(createPaymentDto, idOrder);
  }

  @Get('capture-order-pp/:id')
  async captureOrderPaypal(
    @Query() query: PaypalQuery,
    @Param('id') id: string,
  ): Promise<PaypalCaptureResponse | PaymentResponse> {
    const captureOrder = await this.paypalService.captureOrder(query);

    return await this.paymentsService.assignedNewPayment(id, captureOrder);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Payment> {
    return await this.paymentsService.findOne(id);
  }

  @Get()
  async find(): Promise<Payment[]> {
    return await this.paymentsService.find();
  }

  @Delete()
  async remove(): Promise<string> {
    return 'hola';
  }
}
