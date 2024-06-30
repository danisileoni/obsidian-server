/* eslint-disable @typescript-eslint/dot-notation */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { Request, Response } from 'express';
import { GetUser } from './decorators/get-user.decorator';
import { Auth } from './decorators/auth.decorator';
import { ValidRoles } from './interfaces/valid-roles.enum';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.register(createUserDto, res);
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.login(loginUserDto, res);
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  async loginGoogle(@Res() res: Response): Promise<string | any> {
    return res.status(200);
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async loginGoogleRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    try {
      const user = req.user as User;

      const tokens = await this.authService.jwtSing(user);
      await this.authService.updateRtHash(user.id, tokens.refreshToken);
      res.cookie('token', tokens.accessToken, {
        httpOnly: false,
        sameSite: 'lax',
        secure: true,
      });
      res.cookie('rs-token', tokens.refreshToken, {
        httpOnly: false,
        sameSite: 'lax',
        secure: true,
      });
      res.redirect('http://localhost:5173');
    } catch (error) {
      console.log(error);
      res.redirect('http://localhost:5173');
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(
    @GetUser() user: { id: string; refreshToken: string },
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.refreshTokens(user.id, user.refreshToken, res);
  }

  @Get('verify-access')
  async verifyAccessToken(@Req() req: Request): Promise<any> {
    const headers = req.headers['authorization'];
    const token: string = headers && headers.split(' ')[1];
    return await this.authService.verifyAccessToken(token);
  }

  @Post('logout')
  @Auth(ValidRoles.user)
  async logout(@GetUser() user: User): Promise<boolean> {
    console.log(user);
    return await this.authService.logout(user.id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<string> {
    return await this.authService.update(id, updateUserDto);
  }

  @Get('active')
  @Auth(ValidRoles.user)
  async getUserActive(@GetUser() user: User): Promise<User> {
    return user;
  }
}
