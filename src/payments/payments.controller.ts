import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { type PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { PaymentMethodDto } from './dto/payment-method.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Auth()
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @GetUser() user: User,
  ) {
    return await this.paymentsService.create(createPaymentDto, user);
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
