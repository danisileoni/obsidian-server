import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fetch from 'node-fetch';
import { type ResponseWebHookPaypal } from 'src/types';
import { PaymentsService } from '../payments/payments.service';
import { WsMessageGateway } from '../ws-message/ws-message.gateway';

@Injectable()
export class PaypalWebhookService {
  constructor(
    private readonly paymentService: PaymentsService,
    private readonly configService: ConfigService,
    private readonly wsMessageGateway: WsMessageGateway,
  ) {}

  private readonly API_BASE_URL: string = 'https://api-m.sandbox.paypal.com';
  private readonly CLIENT_ID: string =
    this.configService.get('API_CLIENT_PAYPAL');

  private readonly SECRET: string = this.configService.get('API_SECRET_PAYPAL');
  private readonly WEBHOOK_ID: string =
    this.configService.get('PAYPAL_WEBHOOK_ID');

  async handleWebhook(
    headers: Record<string, string>,
    body: ResponseWebHookPaypal,
  ): Promise<{ status: string }> {
    const orderId = body.resource.purchase_units[0].reference_id;

    const validate = await this.validateWebHook(headers, body);

    if (validate) {
      if (
        body.event_type === 'CHECKOUT.ORDER.APPROVED' ||
        body.event_type === 'CHECKOUT.ORDER.COMPLETED'
      ) {
        const paymentComplete = await this.paymentService.assignedNewPayment(
          orderId,
          body,
        );

        if (paymentComplete) {
          this.wsMessageGateway.sendNotification(
            orderId,
            'Payment completed successfully',
          );
          return {
            status: 'Payment completed successfully',
          };
        }
      } else if (body.event_type === 'CHECKOUT.PAYMENT-APPROVAL.REVERSED') {
        this.wsMessageGateway.sendNotification(orderId, 'Payment cancel');
        return {
          status: 'Payment cancel',
        };
      } else {
        this.wsMessageGateway.sendNotification(orderId, 'Payment pending');
        return {
          status: 'Payment pending',
        };
      }
    } else {
      this.wsMessageGateway.sendNotification(orderId, 'Payment cancel');
      throw new BadRequestException('Something has gone wrong');
    }
  }

  async webHookSimulation(): Promise<boolean> {
    const access_token = await this.getAccessToken();

    await fetch(
      'https://api-m.sandbox.paypal.com/v1/notifications/simulate-event',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          webhook_id: this.WEBHOOK_ID,
          url: 'https://eebb-8-243-19-10.ngrok-free.app/api/v1/paypal-webhook',
          event_type: 'CHECKOUT.ORDER.COMPLETED',
          resource_version: '2.0',
        }),
      },
    ).catch((error) => {
      console.log(error);
      throw new InternalServerErrorException('Check log server');
    });

    return true;
  }

  private async validateWebHook(
    headers: Record<string, string>,
    body: ResponseWebHookPaypal,
  ): Promise<boolean> {
    const {
      'paypal-transmission-id': transmissionId,
      'paypal-transmission-time': transmissionTime,
      'paypal-cert-url': certUrl,
      'paypal-transmission-sig': transmissionSig,
      'paypal-auth-algo': authAlgo,
    } = headers;

    if (
      !transmissionId ||
      !transmissionTime ||
      !certUrl ||
      !transmissionSig ||
      !authAlgo
    ) {
      throw new UnauthorizedException(
        'Missing required PayPal webhook headers',
      );
    }

    const verificationEndpoint = `${this.API_BASE_URL}/v1/notifications/verify-webhook-signature`;

    const requestBody = {
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: this.configService.get('PAYPAL_WEBHOOK_ID'),
      webhook_event: body,
    };

    try {
      const access_token = await this.getAccessToken();

      const { data: verificationResult } = await axios.post(
        verificationEndpoint,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      if (verificationResult.verification_status === 'SUCCESS') {
        console.log('PayPal webhook signature verified successfully.');
        return true;
      } else {
        console.error(
          'Failed to verify PayPal webhook signature:',
          verificationResult,
        );
        return false;
      }
    } catch (error) {
      throw new InternalServerErrorException('Error verifying PayPal webhook');
    }
  }

  private async getAccessToken(): Promise<string> {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    try {
      const { data } = await axios.post(
        `${this.API_BASE_URL}/v1/oauth2/token`,
        params,
        {
          auth: {
            username: this.CLIENT_ID,
            password: this.SECRET,
          },
        },
      );

      const { access_token } = data;
      return access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new InternalServerErrorException('Error getting access token');
    }
  }
}
