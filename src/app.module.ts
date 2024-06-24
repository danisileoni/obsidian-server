import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { FilesModule } from './files/files.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CommonModule } from './common/common.module';
import { AccountsModule } from './accounts/accounts.module';
import { PaymentsModule } from './payments/payments.module';
import { MercadopagoModule } from './mercadopago/mercadopago.module';
import { PaypalModule } from './paypal/paypal.module';
import { SalesModule } from './sales/sales.module';
import { OrdersModule } from './orders/orders.module';
import { MailsModule } from './mails/mails.module';
import { PlatformModule } from './platform/platform.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      port: +process.env.PORT_DB,
      username: process.env.DB_POSTGRES_USER,
      password: process.env.DB_POSTGRES_PASSWORD,
      database: process.env.DB_POSTGRES_NAME,
      autoLoadEntities: true,
      // TODO: in production false
      synchronize: true,
    }),
    PassportModule.register({ session: true }),
    UsersModule,
    AuthModule,
    ProductsModule,
    FilesModule,
    CloudinaryModule,
    CommonModule,
    AccountsModule,
    PaymentsModule,
    MercadopagoModule,
    PaypalModule,
    SalesModule,
    OrdersModule,
    MailsModule,
    PlatformModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [ConfigModule],
})
export class AppModule {}
