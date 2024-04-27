import { Module } from '@nestjs/common';
import { CryptomusController } from './cryptomus.controller';
import { CryptomusService } from './cryptomus.service';

@Module({
  controllers: [CryptomusController],
  providers: [CryptomusService]
})
export class CryptomusModule {}
