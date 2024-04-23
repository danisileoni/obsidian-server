import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Payment } from 'mercadopago';
import { type PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { type MercadoPagoArs } from 'src/types';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MercadopagoService {
  constructor(
    @Inject('MERCADO_PAGO')
    private readonly payment: Payment,
  ) {}

  async createOrder({
    token,
    title,
    description,
    amount,
    email,
    method,
    quantity,
    type,
    numbers,
  }: MercadoPagoArs): Promise<PaymentResponse> {
    try {
      const order = await this.payment.create({
        body: {
          additional_info: {
            items: [
              {
                id: uuid(),
                title,
                description,
                category_id: 'game_digital',
                quantity,
                unit_price: amount,
              },
            ],
          },
          token,
          transaction_amount: amount,
          payer: {
            email,
            identification: {
              type,
              number: numbers,
            },
          },
          description: 'Payment for product',
          payment_method_id: method,
          installments: 1,
        },
      });

      return order;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async searchOrder(id: string): Promise<PaymentResponse> {
    const order = await this.payment.get({
      id,
    });

    if (!order) {
      throw new NotFoundException(`Order not found with id: ${id}`);
    }

    return order;
  }
}