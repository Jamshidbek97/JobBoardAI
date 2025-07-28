import { Module } from '@nestjs/common';
import { JobBoardBatchController } from './job-board-batch.controller';
import { JobBoardBatchService } from './job-board-batch.service';

@Module({
  imports: [],
  controllers: [JobBoardBatchController],
  providers: [JobBoardBatchService],
})
export class JobBoardBatchModule {}
