import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { NotificationModule } from './notification/notification.module';
import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    // Cấu hình môi trường
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Cấu hình TypeORM với SQLite
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        type: 'sqlite',
        database: 'mobile_app.sqlite',
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        synchronize: true, // Không nên dùng trong môi trường production
        logging: true,
      }),
    }),

    // Cấu hình Winston logger
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.colorize(),
            winston.format.printf(
              (info) => `${info.timestamp} [${info.level}] ${info.message}`,
            ),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),

    // Cấu hình Rate Limiting để ngăn chặn tấn công brute force
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 10,
    }]),    // Cấu hình để phục vụ tệp tĩnh
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Module người dùng và module xác thực
    UserModule,
    AuthModule,
    NotificationModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Áp dụng Rate Limiting cho toàn bộ ứng dụng
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
