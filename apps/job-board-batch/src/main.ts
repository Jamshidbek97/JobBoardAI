import { NestFactory } from '@nestjs/core';
import { JobBoardBatchModule } from './job-board-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(JobBoardBatchModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
