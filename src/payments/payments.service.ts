import { Inject, Injectable } from '@nestjs/common';
import { type CreatePaymentDto } from './dto/create-payment.dto';
import { type UpdatePaymentDto } from './dto/update-payment.dto';
import { MercadopagoService } from '../mercadopago/mercadopago.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly mercadopagoService: MercadopagoService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const {
      email,
      amount,
      description,
      method,
      token,
      quantity,
      numbers,
      type,
      title,
    } = createPaymentDto;
    const order = this.mercadopagoService.createOrder(
      token,
      title,
      description,
      amount,
      email,
      method,
      quantity,
      type,
      numbers,
    );

    return await order;
  }

  findAll() {
    return `This action returns all payments`;
  }

  async findOne(id: string) {
    return await this.mercadopagoService.searchOrder(id);
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
