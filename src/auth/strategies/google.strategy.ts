import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  type VerifyCallback,
  type Profile,
} from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      clientID: configService.get('CLIENT_ID'),
      clientSecret: configService.get('CLIENT_SECRET'),
      callbackURL: configService.get('CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const indexAtSign = profile.emails[0].value.indexOf('@');

    const user = await this.authService.validateUserGoogle({
      email: profile.emails[0].value,
      name: `${profile.name.givenName} ${profile.name.familyName}`,
      password: uuid(),
      username: profile.emails[0].value.slice(0, indexAtSign),
    });

    done(null, user);
  }
}
