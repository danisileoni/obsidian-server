import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import { type Order } from 'src/orders/entities/order.entity';

import {
  type ConvertAmount,
  type CancelOrder,
  type PaypalCaptureResponse,
  type PaypalQuery,
  type PaypalResponse,
} from 'src/types';

@Injectable()
export class PaypalService {
  private readonly HOST: string;
  private readonly API_CLIENT: string;
  private readonly API_SECRET: string;
  private readonly API_URL: string;

  constructor() {
    this.HOST = process.env.HOST_FRONT;
    this.API_CLIENT = process.env.API_CLIENT_PAYPAL;
    this.API_SECRET = process.env.API_SECRET_PAYPAL;
    this.API_URL = process.env.API_URL_PAYPAL;
  }

  async create(items: Order, orderId: string): Promise<PaypalResponse> {
    console.log(JSON.stringify(items))
    const itemsConvertUSD = await this.convertUSD(items);
    console.log(JSON.stringify(itemsConvertUSD))

    const body = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          items: itemsConvertUSD.amountUnitsConvert.map((item) => {
            return {
              name: item.title,
              quantity: item.quantity,
              unit_amount: {
                currency_code: 'USD',
                value: item.amount,
              },
            };
          }),
          amount: {
            currency_code: 'USD',
            value: itemsConvertUSD.amountConvert,
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: itemsConvertUSD.amountConvert,
              },
            },
          },
        },
      ],
      application_context: {
        brand_name: 'quarastore.com',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${this.HOST}/shopping-cart/payment/process-payment/${orderId}`,
        cancel_url: `${this.HOST}/paypal/cancel-order`,
      },
    };

    console.log(body.purchase_units.map(item => {
      return item.items.map(item => {
        return 
      })
    }))

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const {
      data: { access_token },
    } = await axios
      .post(`${this.API_URL}/v1/oauth2/token`, params, {
        auth: {
          username: this.API_CLIENT,
          password: this.API_SECRET,
        },
      })
      .catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('Check logs server');
      });

    const response = await axios
      .post(`${this.API_URL}/v2/checkout/orders`, body, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException(error);
      });

    return response.data;
  }

  async captureOrder(query: PaypalQuery): Promise<PaypalCaptureResponse> {
    const { token } = query;

    const response = await axios
      .post(
        `${this.API_URL}/v2/checkout/orders/${token}/capture`,
        {},
        {
          headers: {
            Prefer: 'return=representation',
          },
          auth: {
            username: this.API_CLIENT,
            password: this.API_SECRET,
          },
        },
      )
      .catch((error) => {
        throw new BadRequestException(error);
      });

    return response.data;
  }

  cancelOrder(): CancelOrder {
    return {
      ok: true,
      message: 'Cancel order',
    };
  }

  private async convertUSD(items: Order): Promise<ConvertAmount> {
    try {
      const { data } = await axios
        .get('https://dolarapi.com/v1/dolares/oficial')
        .catch((error) => {
          console.log(error);
          throw new InternalServerErrorException('Check logs server');
        });

      const amountUnitsConvert = items.details.map((item) => {
        return {
          title: item.product.infoProduct.title,
          description: item.product.infoProduct.description,
          quantity: (() => {
            if (item.quantityPrimary > 0) {
              return +item.quantityPrimary;
            }
            if (item.quantitySecondary > 0) {
              return +item.quantitySecondary;
            }
            if (item.quantitySteam > 0) {
              return +item.quantitySteam;
            }
            if (item.quantityPlayStation3 > 0) {
              return +item.quantityPlayStation3;
            }
          })(),
          amount: (() => {
            if (item.quantityPrimary > 0) {
              if (item.product.sale !== null) {
                return +(+item.product.sale.salePrimary / +data.venta).toFixed(2)
                
              }
              return +(+item.product.pricePrimary / +data.venta).toFixed(2)
            }
            if (item.quantitySecondary > 0) {
              if (item.product.sale !== null) {
                return +(+item.product.sale.saleSecondary / +data.venta).toFixed(2)
              }
              return +(+item.product.priceSecondary / +data.venta).toFixed(2)
            }
            if (!(item.quantityPrimary > 0 && item.quantitySecondary > 0)) {
              if (item.product.sale !== null) {
                return +(+item.product.sale.salePrice / +data.venta).toFixed(2)
              }
              return +(+item.product.price / +data.venta).toFixed(2);
            }
            throw new InternalServerErrorException();
          })(),
        };
      });

      let amountConvert: number = 0;

      amountUnitsConvert.forEach((amount) => {
        amountConvert += +amount.amount * +amount.quantity;
      });

      return {
        amountConvert: +amountConvert.toFixed(2),
        amountUnitsConvert,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check logs server');
    }
  }
}
