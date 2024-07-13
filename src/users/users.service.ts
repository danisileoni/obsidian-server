import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { type FilterUserDto } from './dto/filters-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(filterUserDto: FilterUserDto): Promise<{
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    users: User[];
  }> {
    const { search, limit, offset } = filterUserDto;

    const condition = search
      ? {
          id: ILike(`${search}%`),
        }
      : null;

    const users = await this.usersRepository.find({
      where: condition,
      take: limit,
      skip: offset,
    });

    const countsUsers = await this.usersRepository
      .createQueryBuilder()
      .getCount();

    const totalPages: number = Math.ceil(+countsUsers / limit);
    const currentPage: number = Math.floor(offset / limit + 1);
    const hasNextPage: boolean = currentPage < totalPages;

    if (users.length <= 0) {
      throw new NotFoundException('Payments not found');
    }

    return {
      totalPages,
      currentPage,
      hasNextPage,
      users,
    };
  }

  async countUsers(): Promise<{ total: number }> {
    const users = await this.usersRepository.createQueryBuilder().getCount();
    return { total: users };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User not found whit id: ${id}`);
    }

    delete user.roles;
    delete user.isActive;
    delete user.createAt;
    delete user.hashRefreshToken;

    return user;
  }

  async remove(id: string): Promise<string> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }

    await this.usersRepository.remove(user);

    return `Success user remove with id: ${id}`;
  }
}
