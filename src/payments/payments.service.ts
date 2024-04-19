import { BadRequestException, Injectable } from '@nestjs/common';
import { type CreatePaymentDto } from './dto/create-payment.dto';
import { type UpdatePaymentDto } from './dto/update-payment.dto';
import { MercadopagoService } from '../mercadopago/mercadopago.service';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { type PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly mercadopagoService: MercadopagoService,
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
    user: User,
  ): Promise<PaymentResponse> {
    try {
      const order = await this.mercadopagoService.createOrder(createPaymentDto);

      const userAssignedShopping = await this.userRepository.findOne({
        where: { id: user.id },
        relations: ['shopping'],
      });

      userAssignedShopping.shopping = [
        ...userAssignedShopping.shopping,
        ...order.additional_info.items.map((item) => {
          return this.paymentRepository.create({
            idPayment: order.id,
            email: order.payer.email,
            nameProduct: item.title,
          });
        }),
      ];

      await this.userRepository.save(userAssignedShopping);

      return order;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async findOne(id: string): Promise<PaymentResponse> {
    return await this.mercadopagoService.searchOrder(id);
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
