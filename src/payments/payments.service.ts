import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { type CreatePaymentDto } from './dto/create-payment.dto';
import { MercadopagoService } from '../mercadopago/mercadopago.service';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly mercadopagoService: MercadopagoService,
    private readonly paypalService: PaypalService,
  ) {}

  // TODO: make documentation of each slider
  async create(
    createPaymentDto: CreatePaymentDto,
    user: User,
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

      return await this.assignedNewOrders(user.id, order);
    }

    if (paymentGateway === 'paypal') {
      order = await this.paypal(createPaymentDto, user.id);
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

  public async assignedNewOrders(
    idUser: string,
    order: PaypalCaptureResponse | PaymentResponse,
  ): Promise<PaypalCaptureResponse | PaymentResponse> {
    let typeOrder: TypeOrder;

    const shoppingAssignedUser = await this.userRepository.findOne({
      where: { id: idUser },
      relations: ['shopping'],
    });
    if (!shoppingAssignedUser) {
      throw new NotFoundException(`User not found with id: ${idUser}`);
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

    shoppingAssignedUser.shopping.push(
      ...typeOrder.items.map((item: any) => {
        return this.paymentRepository.create({
          idPayment: typeOrder.id.toString(),
          email: typeOrder.payer.email,
          nameProduct: item.name ?? item.title,
          paymentGateway: typeOrder.paymentGateway,
        });
      }),
    );

    await this.userRepository.save(shoppingAssignedUser).catch((error) => {
      console.log(error);
      throw new InternalServerErrorException('Check logs server');
    });

    return order;
  }
}
