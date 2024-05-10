import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { type CreatePaymentDto } from './dto/create-payment.dto';
import { MercadopagoService } from '../mercadopago/mercadopago.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { type PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { type PaymentMethodDto } from './dto/payment-method.dto';
import { PaypalService } from 'src/paypal/paypal.service';
import {
  type TypeOrder,
  type PaypalCaptureResponse,
  type PaypalResponse,
  type ItemEmailPaid,
} from 'src/types';
import { isOrderPaypalCapture } from 'src/common/helpers/isOrderPaypal.helper';
import { Order } from 'src/orders/entities/order.entity';
import { MailsService } from '../mails/mails.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly mercadopagoService: MercadopagoService,
    private readonly paypalService: PaypalService,
    private readonly mailsService: MailsService,
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
    const queryRunner = this.dataSource.createQueryRunner();

    const orderToPaid = await this.orderRepository.findOneBy({ id: idOrder });
    if (!orderToPaid) {
      throw new NotFoundException(`Order not found with id: ${idOrder}`);
    }

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

    try {
      await queryRunner.connect();

      const payment = this.paymentRepository.create({
        idPayment: typeOrder.id.toString(),
        email: typeOrder.payer.email,
        paymentGateway: typeOrder.paymentGateway,
        order: orderToPaid,
      });

      const account: ItemEmailPaid[] = await queryRunner.query(`
      SELECT
        *
      FROM return_accounts_paid('${idOrder}');
      `);

      await this.mailsService.sendConfirmPaid(
        'obsidiandigitales@outlook.com.ar',
        account,
      );

      await this.paymentRepository.save(payment);

      orderToPaid.paid = true;
      orderToPaid.payment = payment;
      await this.orderRepository.save(orderToPaid);

      return order;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check logs server');
    } finally {
      await queryRunner.release();
    }
  }
}
