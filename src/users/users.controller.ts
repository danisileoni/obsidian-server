import {
  Controller,
  Get,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { type User } from './entities/user.entity';
import { FilterUserDto } from './dto/filters-user.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() filterUserDto: FilterUserDto): Promise<{
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    users: User[];
  }> {
    return await this.usersService.findAll(filterUserDto);
  }

  @Get('count')
  async countUsers(): Promise<{ total: number }> {
    return await this.usersService.countUsers();
  }

  @Get('search/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return await this.usersService.findOne(id);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return await this.usersService.remove(id);
  }
}
