import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { type CreatePlatformDto } from './dto/create-platform.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Platform } from './entities/platform.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlatformService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
  ) {}

  async create(createPlatformDto: CreatePlatformDto): Promise<Platform> {
    const platform = this.platformRepository.create(createPlatformDto);

    try {
      await this.platformRepository.save(platform);
      return platform;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check server logs');
    }
  }

  async findAll(): Promise<Platform[]> {
    const platforms = await this.platformRepository.find();

    if (platforms.length < 1) {
      throw new NotFoundException('Not founds platforms');
    }

    return platforms;
  }

  async findOne(id: string): Promise<Platform> {
    const platform = await this.platformRepository.findOneBy({ id });
    if (!platform) {
      throw new NotFoundException(`Platform not found with id: ${id}`);
    }

    return platform;
  }

  async remove(id: string): Promise<{ message: string }> {
    const platform = await this.platformRepository.findOneBy({ id });

    await this.platformRepository.remove(platform);
    return {
      message: 'Remove Success',
    };
  }
}
