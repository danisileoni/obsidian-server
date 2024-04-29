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
  private readonly HOST: string;

  constructor(
    @Inject('MERCADO_PAGO')
    private readonly payment: Payment,
  ) {
    this.HOST = process.env.HOST;
  }

  async createOrder({
    token,
    items,
    amount,
    email,
    method,
    type,
    numbers,
  }: MercadoPagoArs): Promise<PaymentResponse> {
    try {
      const order = await this.payment.create({
        body: {
          additional_info: {
            items: items.map((item) => {
              return {
                id: uuid(),
                title: item.title,
                description: item.description,
                category_id: 'game_digital',
                quantity: item.quantity,
                unit_price: item.amount,
              };
            }),
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
      console.log(error);
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
