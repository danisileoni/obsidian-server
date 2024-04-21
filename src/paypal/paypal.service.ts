import { BadRequestException, Injectable } from '@nestjs/common';
import axiosPaypal from 'src/common/interceptor/axios.interceptor';
import {
  type PaypalCaptureResponse,
  type PaypalQuery,
  type PaypalResponse,
} from 'src/types';

@Injectable()
export class PaypalService {
  private readonly HOST: string;

  constructor() {
    this.HOST = process.env.HOST;
  }

  async create(): Promise<PaypalResponse> {
    // pass to args
    const body = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: `120`,
          },
        },
      ],
      application_context: {
        brand_name: 'obsidiandigitales.com',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${this.HOST}/paypal/capture-order`,
        cancel_url: `${this.HOST}/paypal/cancel-order`,
      },
    };

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const {
      data: { access_token },
    } = await axiosPaypal.post('/v1/oauth2/token', params);

    const response = await axiosPaypal
      .post('/v2/checkout/orders', body, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });

    return response.data;
  }

  async captureOrder(query: PaypalQuery): Promise<PaypalCaptureResponse> {
    const { token } = query;

    const response = await axiosPaypal
      .post(`/v2/checkout/orders/${token}/capture`, {})
      .catch((error) => {
        throw new BadRequestException(error);
      });

    return response.data;
  }

  async cancelOrder(): Promise<object> {
    return {
      ok: true,
      message: 'Cancel order',
    };
  }
}
