import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from '../auth/auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { SessionSerializer } from './utils/serializer';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { MailsModule } from 'src/mails/mails.module';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    SessionSerializer,
    JwtRefreshStrategy,
  ],
  imports: [
    UsersModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    MailsModule,
  ],
  exports: [
    JwtModule,
    JwtStrategy,
    PassportModule,
    GoogleStrategy,
    JwtRefreshStrategy,
  ],
})
export class AuthModule {}
