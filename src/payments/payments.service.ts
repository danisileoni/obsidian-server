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
import { type PaypalCaptureResponse, type PaypalResponse } from 'src/types';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly mercadopagoService: MercadopagoService,
    private readonly paypalService: PaypalService,
  ) {}

  // TODO: make documentation of each slider
  async create(
    createPaymentDto: CreatePaymentDto,
    user: User,
  ): Promise<CreatePaymentDto | PaymentResponse | PaypalResponse> {
    let order: CreatePaymentDto | PaymentResponse | PaypalResponse;
    const { paymentGateway } = createPaymentDto;
    let shoppingAssignedUser: User;

    if (!paymentGateway) {
      throw new BadRequestException('Property not found in body');
    }

    if (paymentGateway === 'mercadopago') {
      shoppingAssignedUser = await this.userRepository.findOne({
        where: { id: user.id },
        relations: ['shopping'],
      });
      if (!shoppingAssignedUser) {
        throw new NotFoundException(`User not found with id: ${user.id}`);
      }
      order = await this.mercadoPago(createPaymentDto, shoppingAssignedUser);

      await this.userRepository.save(shoppingAssignedUser).catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('Check logs server');
      });
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

  // remove(id: number) {
  //   return `This action removes a #${id} payment`;
  // }

  private async mercadoPago(
    data: CreatePaymentDto,
    shoppingAssignedUser: User,
  ): Promise<PaymentResponse> {
    console.log(data);

    const order = await this.mercadopagoService
      .createOrder(data)
      .catch((error) => {
        throw new BadRequestException(error);
      });

    shoppingAssignedUser.shopping.push(
      ...order.additional_info.items.map((item) => {
        return this.paymentRepository.create({
          idPayment: order.id.toString(),
          email: order.payer.email,
          nameProduct: item.title,
          paymentGateway: data.paymentGateway,
        });
      }),
    );

    return order;
  }

  public async paypalCapture(order: PaypalCaptureResponse, id: string) {
    const shoppingAssignedUser = await this.userRepository.findOne({
      where: { id },
      relations: ['shopping'],
    });
    if (!shoppingAssignedUser) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }

    shoppingAssignedUser.shopping.push(
      ...order.purchase_units[0].items.map((item) => {
        return this.paymentRepository.create({
          idPayment: order.id,
          email: order.payer.email_address,
          nameProduct: item.name,
          paymentGateway: 'paypal',
        });
      }),
    );

    await this.userRepository.save(shoppingAssignedUser).catch((error) => {
      console.log(error);
      throw new InternalServerErrorException('Check logs server');
    });

    return order;
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
}
