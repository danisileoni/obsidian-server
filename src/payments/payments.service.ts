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
import { AccountsService } from '../accounts/accounts.service';
import { AccountPaid } from 'src/accounts/entities/accounts-paid.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(AccountPaid)
    private readonly accountPaidRepository: Repository<AccountPaid>,
    private readonly dataSource: DataSource,
    private readonly mercadopagoService: MercadopagoService,
    private readonly paypalService: PaypalService,
    private readonly mailsService: MailsService,
    private readonly accountsService: AccountsService,
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

    const items = await this.orderRepository.findOne({
      relations: {
        details: {
          product: {
            infoProduct: true,
          },
        },
      },
      where: { id: idOrder },
    });

    if (!items) {
      throw new NotFoundException(`Order not found with id: ${idOrder}`);
    }

    if (paymentGateway === 'mercadopago') {
      order = await this.mercadopagoService
        .createOrder(createPaymentDto, items)
        .catch((error) => {
          throw new BadRequestException(error);
        });
      return await this.assignedNewPayment(idOrder, order);
    }

    if (paymentGateway === 'paypal') {
      order = await this.paypal(items, idOrder);
    }

    return order;
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOneBy({ id });

    if (!payment) {
      throw new NotFoundException(`Payment not found with id: ${id}`);
    }

    return payment;
  }

  async find(): Promise<Payment[]> {
    const payments = await this.paymentRepository.find();

    if (payments.length <= 0) {
      throw new NotFoundException('Payments not found');
    }

    return payments;
  }

  private async paypal(data: Order, userId: string): Promise<PaypalResponse> {
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
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderToPaid = await this.orderRepository.findOneBy({ id: idOrder });
      if (!orderToPaid) {
        throw new NotFoundException(`Order not found with id: ${idOrder}`);
      }

      const payment = this.paymentRepository.create({
        idPayment: typeOrder.id.toString(),
        email: typeOrder.payer.email,
        paymentGateway: typeOrder.paymentGateway,
        order: orderToPaid,
      });

      const accounts: ItemEmailPaid[] = await queryRunner.query(`
      SELECT
        *
      FROM return_accounts_paid(${+idOrder});
      `);

      const deCryptAccount: ItemEmailPaid[] = accounts.map((account) => {
        return {
          email: this.accountsService.getDecrypt(account.email),
          password: this.accountsService.getDecrypt(account.password),
          image_url: account.image_url,
          product_name: account.product_name,
          platform_name: account.platform_name,
          type_account: account.type_account,
          id_account: account.id_account,
        };
      });

      await this.mailsService.sendConfirmPaid(
        'obsidiandigitales@outlook.com.ar',
        deCryptAccount,
      );

      await queryRunner.manager.save(payment);

      const accountPaid = accounts.map((account) => {
        return this.accountPaidRepository.create({
          payment,
          account: { id: account.id_account },
        });
      });

      orderToPaid.paid = true;
      orderToPaid.payment = payment;
      await queryRunner.manager.save(orderToPaid);
      await queryRunner.manager.save(accountPaid);

      await queryRunner.commitTransaction();

      return order;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Check logs server');
    } finally {
      await queryRunner.release();
    }
  }
}
