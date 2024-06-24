/* eslint-disable @typescript-eslint/ban-types */
import { PassportSerializer } from '@nestjs/passport';
import { type User } from 'src/users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: Function): void {
    done(null, user);
  }

  async deserializeUser(
    payLoad: { id: string },
    done: Function,
  ): Promise<User> {
    const user = await this.usersService.findOne(payLoad.id);
    return user ? done(null, user) : done(null, null);
  }
}
