import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { type CreatePaymentDto } from './dto/create-payment.dto';
import { MercadopagoService } from '../mercadopago/mercadopago.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { type PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { PaypalService } from 'src/paypal/paypal.service';
import {
  type TypeOrder,
  type PaypalResponse,
  type ItemEmailPaid,
  type ResponseWebHookPaypal,
} from 'src/types';
import { isOrderPaypalCapture } from 'src/common/helpers/isOrderPaypal.helper';
import { Order } from 'src/orders/entities/order.entity';
import { MailsService } from '../mails/mails.service';
import { AccountsService } from '../accounts/accounts.service';
import { AccountPaid } from 'src/accounts/entities/accounts-paid.entity';
import { type FilterPaymentDto } from './dto/filters-payment.dto';

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

    if (items.paid) {
      throw new BadRequestException('The order has already been paid');
    }

    if (paymentGateway === 'mercadopago') {
      order = await this.mercadopagoService
        .createOrder(createPaymentDto, items, idOrder)
        .catch((error) => {
          throw new BadRequestException(error);
        });
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

  async find(filterPaymentDto: FilterPaymentDto): Promise<{
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    payments: Payment[];
  }> {
    const { search, limit, offset } = filterPaymentDto;

    const whereCondition = search
      ? { idPayment: ILike(`${search.trim()}%`) }
      : {};

    const payments = await this.paymentRepository.find({
      where: whereCondition,
      relations: {
        order: {
          details: true,
          user: true,
        },
      },
      order: {
        paymentAt: {
          direction: 'DESC',
        },
      },
      skip: offset,
      take: limit,
    });

    const countsPayment = await this.paymentRepository
      .createQueryBuilder()
      .getCount();

    const totalPages: number = Math.ceil(+countsPayment / limit);
    const currentPage: number = Math.floor(offset / limit + 1);
    const hasNextPage: boolean = currentPage < totalPages;

    if (payments.length <= 0) {
      throw new NotFoundException('Payments not found');
    }

    return {
      totalPages,
      currentPage,
      hasNextPage,
      payments,
    };
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
    order: ResponseWebHookPaypal | PaymentResponse,
  ): Promise<boolean> {
    let typeOrder: TypeOrder;
    const queryRunner = this.dataSource.createQueryRunner();

    if (isOrderPaypalCapture(order)) {
      typeOrder = {
        id: order.id,
        items: order.resource.purchase_units[0].items,
        payer: {
          email: order.resource.payment_source.paypal.email_address,
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
      const orderToPaid = await this.orderRepository.findOne({
        where: { id: idOrder },
        relations: {
          details: {
            product: {
              infoProduct: true,
              platform: true,
            },
          },
        },
      });
      if (!orderToPaid) {
        throw new NotFoundException(`Order not found with id: ${idOrder}`);
      }
      if (orderToPaid.paid) {
        throw new BadRequestException('You ve already been paid');
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
          product_id: account.product_id,
        };
      });

      const missingAccount = orderToPaid.details.map((detail) => {
        const filterProduct = deCryptAccount.filter(
          (item) => item.product_id === detail.product.id,
        );
        if (filterProduct.length === 0) {
          return {
            id: detail.product.id,
            title: detail.product.infoProduct.title,
            typeAccount: detail.quantityPrimary > 0 ? 'Primaria' : 'Secundaria',
            platformAccount: detail.product.platform.namePlatform,
            userEmail: orderToPaid.user.email,
            userId: orderToPaid.user.id,
          };
        }
      });

      if (missingAccount.length > 0) {
        await this.mailsService.sendMissingAccounts(missingAccount);
      }

      if (deCryptAccount.length > 0) {
        await this.mailsService.sendConfirmPaid(
          orderToPaid.user.email,
          deCryptAccount,
        );
      }

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

      return true;
    } catch (error) {
      console.log({ error });
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Check logs server');
    } finally {
      await queryRunner.release();
    }
  }
}
