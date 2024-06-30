import { Module, forwardRef } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MercadopagoModule } from 'src/mercadopago/mercadopago.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';
import { PaypalModule } from 'src/paypal/paypal.module';
import { Account } from 'src/accounts/entities/account.entity';
import { ProductsModule } from 'src/products/products.module';
import { Order } from 'src/orders/entities/order.entity';
import { OrdersDetails } from 'src/orders/entities/orders-details.entity';
import { MailsModule } from '../mails/mails.module';
import { AccountsModule } from '../accounts/accounts.module';
import { AccountPaid } from 'src/accounts/entities/accounts-paid.entity';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      User,
      Account,
      Order,
      OrdersDetails,
      AccountPaid,
    ]),
    MercadopagoModule,
    AuthModule,
    PassportModule,
    forwardRef(() => PaypalModule),
    ProductsModule,
    MailsModule,
    AccountsModule,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
