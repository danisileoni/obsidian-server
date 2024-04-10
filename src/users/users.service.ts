import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    const user = await this.usersRepository.find();
    return user;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User not found whit id: ${id}`);
    }

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
