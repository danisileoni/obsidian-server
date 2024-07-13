import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { type Account } from './entities/account.entity';
import { type Stock } from 'src/types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.enum';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('create')
  @Auth(ValidRoles.admin)
  async create(@Body() createAccountDto: CreateAccountDto): Promise<object> {
    return await this.accountsService.create(createAccountDto);
  }

  @Get('search/:id')
  @Auth(ValidRoles.admin)
  async findOne(@Param('id') id: string): Promise<Account> {
    return await this.accountsService.findOne(id);
  }

  @Get('find-accounts')
  @Auth(ValidRoles.admin)
  async findSelect(
    @Query('productsId') productsId: string,
  ): Promise<Array<{ id: number; quantity: number }>> {
    return await this.accountsService.findSelect(productsId);
  }

  @Get('count')
  @Auth(ValidRoles.admin)
  async countAll(): Promise<{ total: number }> {
    return await this.accountsService.countAll();
  }

  @Get('stock/:id')
  @Auth(ValidRoles.admin)
  async stock(@Param('id') id: string): Promise<Stock> {
    return await this.accountsService.stock(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    return await this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  async remove(@Param('id') id: string): Promise<object> {
    return await this.accountsService.remove(id);
  }
}
