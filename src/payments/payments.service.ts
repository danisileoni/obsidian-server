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

    if (!paymentGateway) {
      throw new BadRequestException('Property not found in body');
    }

    const shoppingAssignedUser = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['shopping'],
    });
    if (!shoppingAssignedUser) {
      throw new NotFoundException(`User not found with id: ${user.id}`);
    }

    if (paymentGateway === 'mercadopago') {
      order = await this.mercadoPago(createPaymentDto, shoppingAssignedUser);
    }

    if (paymentGateway === 'paypal') {
      order = await this.paypal(createPaymentDto);
    }

    console.log({ shoppingAssignedUser });

    await this.userRepository.save(shoppingAssignedUser).catch((error) => {
      console.log(error);
      throw new InternalServerErrorException('Check logs server');
    });

    return order;
  }

  async findOne(
    id: string,
    paymentMethodDto: PaymentMethodDto,
  ): Promise<PaymentResponse> {
    return await this.mercadopagoService.searchOrder(id);
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }

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
          idPayment: order.id,
          email: order.payer.email,
          nameProduct: item.title,
          paymentGateway: data.paymentGateway,
        });
      }),
    );

    return order;
  }

  public async paypalCapture(
    data: PaypalCaptureResponse,
    shoppingAssignedUser: User,
  ) {
    shoppingAssignedUser.shopping.push(
      ...this.paymentRepository.create({
        idPayment: order.id,
        email: order.payer.email,
        nameProduct: item.title,
        paymentGateway: data.paymentGateway,
      }),
    );
  }

  private async paypal(data: CreatePaymentDto): Promise<PaypalResponse> {
    const order = await this.paypalService.create(data).catch((error) => {
      console.log(error);
      throw new InternalServerErrorException('Check logs server');
    });

    return order;
  }
}
