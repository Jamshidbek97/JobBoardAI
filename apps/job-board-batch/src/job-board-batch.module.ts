import { Module } from '@nestjs/common';
import { JobBoardBatchController } from './job-board-batch.controller';
import { JobBoardBatchService } from './job-board-batch.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [JobBoardBatchController],
  providers: [JobBoardBatchService],
})
export class JobBoardBatchModule {}
