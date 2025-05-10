import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdir } from 'fs/promises';

async function bootstrap() {
  // Đảm bảo thư mục logs tồn tại
  try {
    await mkdir(join(process.cwd(), 'logs'), { recursive: true });
  } catch (error) {
    // Bỏ qua lỗi nếu thư mục đã tồn tại
  }

  // Khởi tạo ứng dụng với Express
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // Sử dụng Winston cho logging
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const logger = new Logger('Bootstrap');
  
  // Thêm Helmet để bảo vệ các HTTP headers
  app.use(helmet());
  
  // Enable validation pipes globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Cấu hình CORS chi tiết
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://yourfrontenddomain.com'], // Thêm cổng 3001 cho React app
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Mobile Backend API')
    .setDescription('API documentation for the mobile backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  // Khởi động server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation available at: http://localhost:${port}/api`);
}
bootstrap();
