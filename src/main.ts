import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import * as csurf from 'csurf';
import { v4 as uuid } from 'uuid';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: true });

  // TODO: rate limit

  app.enableCors({
    origin: ['http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(
    session({
      secret: process.env.EXPRESS_SESSION_KEY,
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 30000,
      },
      genid: function (req) {
        return uuid();
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cookieParser());
  // app.use(csurf());

  await app.listen(3000);
}
void bootstrap();
