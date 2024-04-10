import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { type CreateUserDto } from 'src/users/dto/create-user.dto';
import { type LoginUserDto } from './dto/login-user.dto';
import { type UpdateUserDto } from 'src/users/dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { type Response } from 'express';
import { type JwtPayload } from './interfaces/jwt-payload.interface';

const options = {
  timeCost: 2,
  memoryCost: 65536,
  parallelism: 2,
  hashLength: 40,
  type: argon2.argon2id,
  version: 0x13,
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    createUserDto: CreateUserDto,
    res: Response,
  ): Promise<Response<User>> {
    const { password, confirmPassword, ...userData } = createUserDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords are not the same');
    }

    const user = this.usersRepository.create({
      ...userData,
      password: await argon2.hash(createUserDto.password, options),
    });

    await this.usersRepository.save(user).catch((error) => {
      const detailsError = error.detail.match(/Key \(([^)]+)\)=\(([^)]+)\)/);
      throw new BadRequestException(
        `The ${detailsError[1]} '${detailsError[2]}' already exists`,
      );
    });
    delete user.password;

    const token = await this.jwtSing(user);
    res.cookie('token', token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
    });
    return res.status(200).send({ user });
  }

  async login(
    loginUserDto: LoginUserDto,
    res: Response,
  ): Promise<Response<User>> {
    const { password, username } = loginUserDto;

    const user = await this.usersRepository.findOne({
      where: { username },
      select: { username: true, password: true, id: true },
    });

    if (!user || !(await argon2.verify(user.password, password))) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    delete user.password;

    const token = await this.jwtSing(user);
    res.cookie('token', token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
    });
    return res.status(200).send({ user });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    if (updateUserDto.password !== updateUserDto.confirmPassword) {
      throw new BadRequestException('Passwords are not the same');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await argon2.hash(
        updateUserDto.password,
        options,
      );
    }

    const user = await this.usersRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException(`Not found user with id ${id}`);
    }

    try {
      await this.usersRepository.save(user);
      delete user.password;
      return user;
    } catch (error) {
      const detailsError = error.detail.match(/Key \(([^)]+)\)=\(([^)]+)\)/);
      throw new BadRequestException(
        `The ${detailsError[1]} '${detailsError[2]}' already exists`,
      );
    }
  }

  private async jwtSing(payload: JwtPayload): Promise<string> {
    const token = await this.jwtService.signAsync({ id: payload.id });
    return token;
  }
}