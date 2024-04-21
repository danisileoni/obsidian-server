import { IsString } from 'class-validator';

export class PaymentMethodDto {
  @IsString()
  paymentGateway: string;
}
