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
import { type PaypalResponse } from 'src/types';
import { type Payment } from './entities/payment.entity';
import { FilterPaymentDto } from './dto/filters-payment.dto';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.enum';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create/:id')
  @Auth()
  async create(
    @Param('id') idOrder: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponse | PaypalResponse> {
    return await this.paymentsService.create(createPaymentDto, idOrder);
  }

  @Get(':id')
  @Auth(ValidRoles.admin)
  async findOne(@Param('id') id: string): Promise<Payment> {
    return await this.paymentsService.findOne(id);
  }

  @Get()
  @Auth(ValidRoles.admin)
  async find(@Query() filterPaymentDto: FilterPaymentDto): Promise<{
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    payments: Payment[];
  }> {
    return await this.paymentsService.find(filterPaymentDto);
  }

  @Delete()
  @Auth(ValidRoles.admin)
  async remove(): Promise<string> {
    return 'hola';
  }
}
