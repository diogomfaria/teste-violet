import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
  const configService = app.get(ConfigService);
  const port = process.env.PORT ?? 3002;
  
  await app.listen(port);
  
  // Log MongoDB connection status
  const mongoUri = configService.get('MONGODB_URI') || 'mongodb://localhost:27017/app';
  logger.log(`🚀 Server running on http://localhost:${port}`);
  logger.log(`🔗 MongoDB connected to: ${mongoUri.split('@').pop() || mongoUri}`);
  
  // Log if running in development mode
  if (process.env.NODE_ENV === 'development') {
    logger.log('⚡ Running in development mode');
  }
}

bootstrap().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
