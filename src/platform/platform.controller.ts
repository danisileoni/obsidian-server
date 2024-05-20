import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { type Platform } from './entities/platform.entity';

@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Post()
  async create(
    @Body() createPlatformDto: CreatePlatformDto,
  ): Promise<Platform> {
    return await this.platformService.create(createPlatformDto);
  }

  @Get()
  async findAll(): Promise<Platform[]> {
    return await this.platformService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Platform> {
    return await this.platformService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return await this.platformService.remove(id);
  }
}
