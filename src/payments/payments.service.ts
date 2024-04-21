import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { type CreatePaymentDto } from './dto/create-payment.dto';
import { type UpdatePaymentDto } from './dto/update-payment.dto';
import { MercadopagoService } from '../mercadopago/mercadopago.service';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { type PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { type PaymentMethodDto } from './dto/payment-method.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly mercadopagoService: MercadopagoService,
  ) {}

  // TODO: make documentation of each slider
  async create(
    createPaymentDto: CreatePaymentDto,
    user: User,
  ): Promise<CreatePaymentDto | PaymentResponse> {
    let order: CreatePaymentDto | PaymentResponse;
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

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }

  private async mercadoPago(
    data: CreatePaymentDto,
    shoppingAssignedUser: User,
  ): Promise<PaymentResponse> {
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
}
