import { Module } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { PlatformController } from './platform.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from './entities/platform.entity';

@Module({
  controllers: [PlatformController],
  imports: [TypeOrmModule.forFeature([Platform])],
  providers: [PlatformService],
})
export class PlatformModule {}
