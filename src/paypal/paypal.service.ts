import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';

import {
  type ConvertAmount,
  type Item,
  type CancelOrder,
  type PaypalCaptureResponse,
  type PaypalQuery,
  type PaypalResponse,
} from 'src/types';

@Injectable()
export class PaypalService {
  // TODO: ARREGLA ESTA PORONGA
  private readonly HOST: string;
  private readonly API_CLIENT: string;
  private readonly API_SECRET: string;
  private readonly API_URL: string;

  constructor() {
    this.HOST = process.env.HOST;
    this.API_CLIENT = process.env.API_CLIENT_PAYPAL;
    this.API_SECRET = process.env.API_SECRET_PAYPAL;
    this.API_URL = process.env.API_URL_PAYPAL;
  }

  async create(
    {
      amount,
      items,
    }: {
      amount: number;
      items: Item[];
    },
    orderId: string,
  ): Promise<PaypalResponse> {
    const convertUSD = await this.convertUSD(amount, items);
    const body = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          items: convertUSD.amountUnitsConvert.map((item) => {
            return {
              name: item.title,
              description: item.description,
              quantity: item.quantity,
              unit_amount: {
                currency_code: 'USD',
                value: item.amount,
              },
            };
          }),
          amount: {
            currency_code: 'USD',
            value: convertUSD.amountConvert,
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: convertUSD.amountConvert,
              },
            },
          },
        },
      ],
      application_context: {
        brand_name: 'obsidiandigitales.com',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${this.HOST}/payments/capture-order-pp/${orderId}`,
        cancel_url: `${this.HOST}/paypal/cancel-order`,
      },
    };

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

  private async convertUSD(
    amount: number,
    items: Item[],
  ): Promise<ConvertAmount> {
    try {
      const { data } = await axios.get(
        'https://dolarapi.com/v1/dolares/oficial',
      );

      const amountConvert = parseFloat((amount / data.venta).toFixed(2));

      const amountUnitsConvert = items.map((item) => {
        item.amount = parseFloat((item.amount / data.venta).toFixed(2));
        return item;
      });

      return {
        amountConvert,
        amountUnitsConvert,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check logs server');
    }
  }
}
