import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment } from 'mercadopago';
import { type PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { type Order } from 'src/orders/entities/order.entity';
import { type MercadoPagoArs } from 'src/types';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MercadopagoService {
  constructor(
    @Inject('MERCADO_PAGO')
    private readonly payment: Payment,
    private readonly configService: ConfigService,
  ) {}

  async createOrder(
    { token, email, method, type, numbers }: MercadoPagoArs,
    items: Order,
    idOrder: string,
  ): Promise<PaymentResponse> {
    console.log(method);
    try {
      const amount = items.details.reduce((sum, item) => {
        if (item.quantityPrimary > 0) {
          return sum + +item.product.pricePrimary;
        }
        if (item.quantitySecondary > 0) {
          return sum + +item.product.priceSecondary;
        }
        if (!(item.quantityPrimary > 0 && item.quantitySecondary > 0)) {
          return sum + +item.product.price;
        }
        throw new InternalServerErrorException();
      }, 0);

      const order = await this.payment.create({
        body: {
          additional_info: {
            items: items.details.map((item) => {
              return {
                id: uuid(),
                title: item.product.infoProduct.title,
                category_id: 'game_digital',
                quantity: (() => {
                  if (+item.quantityPrimary > 0) {
                    return item.quantityPrimary;
                  }
                  if (+item.quantitySecondary > 0) {
                    return item.quantitySecondary;
                  }
                  if (
                    !(+item.quantityPrimary > 0 && +item.quantitySecondary > 0)
                  ) {
                    return +item.quantitySteam;
                  }
                  throw new InternalServerErrorException();
                })(),
                unit_price: (() => {
                  if (+item.quantityPrimary > 0) {
                    if (item.product.sale) {
                      return +item.product.sale.salePrimary;
                    }
                    return +item.product.pricePrimary;
                  }
                  if (+item.quantitySecondary > 0) {
                    if (item.product.sale) {
                      return +item.product.sale.saleSecondary;
                    }
                    return +item.product.priceSecondary;
                  }
                  if (
                    !(+item.quantityPrimary > 0 && +item.quantitySecondary > 0)
                  ) {
                    if (item.product.sale) {
                      return +item.product.sale.salePrice;
                    }
                    return +item.product.price;
                  }
                  throw new InternalServerErrorException();
                })(),
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
          metadata: { id_order: idOrder },
          notification_url: `${this.configService.get('HOST_TEST')}/mercadopago/webhook-mp`,
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
