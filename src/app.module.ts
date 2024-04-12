import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { FilesModule } from './files/files.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      port: +process.env.PORT_DB,
      username: process.env.DB_POSTGRES_USER,
      password: process.env.DB_POSTGRES_PASSWORD,
      database: process.env.DB_POSTGRES_NAME,
      autoLoadEntities: true,
      // in production false
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    FilesModule,
    CloudinaryModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
