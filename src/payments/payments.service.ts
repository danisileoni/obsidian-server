import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { type CreatePaymentDto } from './dto/create-payment.dto';
import { MercadopagoService } from '../mercadopago/mercadopago.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { type PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { type PaymentMethodDto } from './dto/payment-method.dto';
import { PaypalService } from 'src/paypal/paypal.service';
import {
  type TypeOrder,
  type PaypalCaptureResponse,
  type PaypalResponse,
} from 'src/types';
import { isOrderPaypalCapture } from 'src/common/helpers/isOrderPaypal.helper';
import { Account } from 'src/accounts/entities/account.entity';
import { Order } from 'src/orders/entities/order.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly mercadopagoService: MercadopagoService,
    private readonly paypalService: PaypalService,
  ) {}

  // TODO: make documentation of each slider
  async create(
    createPaymentDto: CreatePaymentDto,
    idOrder: string,
  ): Promise<PaymentResponse | PaypalResponse> {
    let order: PaymentResponse | PaypalResponse;
    const { paymentGateway } = createPaymentDto;

    if (!paymentGateway) {
      throw new BadRequestException('Property not found in body');
    }

    if (paymentGateway === 'mercadopago') {
      order = await this.mercadopagoService
        .createOrder(createPaymentDto)
        .catch((error) => {
          throw new BadRequestException(error);
        });

      return await this.assignedNewPayment(idOrder, order);
    }

    if (paymentGateway === 'paypal') {
      order = await this.paypal(createPaymentDto, idOrder);
    }

    return order;
  }

  async findOne(
    id: string,
    paymentMethodDto: PaymentMethodDto,
  ): Promise<PaymentResponse> {
    return await this.mercadopagoService.searchOrder(id);
  }

  private async paypal(
    data: CreatePaymentDto,
    userId: string,
  ): Promise<PaypalResponse> {
    const order = await this.paypalService
      .create(data, userId)
      .catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('Check logs server');
      });

    return order;
  }

  public async assignedNewPayment(
    idOrder: string,
    order: PaypalCaptureResponse | PaymentResponse,
  ): Promise<PaypalCaptureResponse | PaymentResponse> {
    let typeOrder: TypeOrder;

    const orderToPaid = await this.orderRepository.findOneBy({ id: idOrder });
    if (!orderToPaid) {
      throw new NotFoundException(`Order not found with id: ${idOrder}`);
    }
    console.log(orderToPaid);

    const accounts = await this.accountRepository.find({
      where: {
        product: In(
          orderToPaid.details.map((details) => {
            return details.product.id;
          }),
        ),
      },
    });

    console.log(accounts);

    if (isOrderPaypalCapture(order)) {
      typeOrder = {
        id: order.id,
        items: order.purchase_units[0].items,
        payer: {
          email: order.payer.email_address,
        },
        paymentGateway: 'paypal',
      };
    } else {
      typeOrder = {
        id: order.id,
        items: order.additional_info.items,
        payer: {
          email: order.payer.email,
        },
        paymentGateway: 'mercadopago',
      };
    }

    const payment = this.paymentRepository.create({
      idPayment: typeOrder.id.toString(),
      email: typeOrder.payer.email,
      paymentGateway: typeOrder.paymentGateway,
      order: orderToPaid,
    });

    orderToPaid.payment = payment;
    orderToPaid.paid = true;

    await this.orderRepository.save(orderToPaid);
    await this.paymentRepository.save(payment);

    return order;
  }
}
