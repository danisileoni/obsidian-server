import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { type Account } from './entities/account.entity';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('create')
  async create(@Body() createAccountDto: CreateAccountDto): Promise<object> {
    return await this.accountsService.create(createAccountDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Account> {
    return await this.accountsService.findOne(id);
  }

  @Get('stock/:id')
  async stock(@Param('id') id: string): Promise<{
    quantityPrimary: number;
    quantitySecondary: number;
  }> {
    return await this.accountsService.stock(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    return await this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<object> {
    return await this.accountsService.remove(id);
  }
}
