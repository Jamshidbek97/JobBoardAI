import { NestFactory } from '@nestjs/core';
import { JobBoardBatchModule } from './job-board-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(JobBoardBatchModule);
  await app.listen(process.env.PORT_BATCH ?? 3002);
}
bootstrap();
