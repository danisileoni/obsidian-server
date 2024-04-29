import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { type PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { PaymentMethodDto } from './dto/payment-method.dto';
import { PaypalService } from 'src/paypal/paypal.service';
import {
  PaypalCaptureResponse,
  PaypalQuery,
  type PaypalResponse,
} from 'src/types';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paypalService: PaypalService,
  ) {}

  @Post()
  @Auth()
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @GetUser() user: User,
  ) {
    return await this.paymentsService.create(createPaymentDto, user);
  }

  @Get('capture-order-pp/:id')
  async captureOrderPaypal(
    @Query() query: PaypalQuery,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const captureOrder = await this.paypalService.captureOrder(query);

    return await this.paymentsService.assignedNewOrders(id, captureOrder);
  }

  // @Post('capture-order-mp')
  // async captureOrderMP(
  //   @Query() query: PaypalQuery,
  //   @Param('id', ParseUUIDPipe) id: string,
  // ) {
  //   console.log(query);
  // }

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
