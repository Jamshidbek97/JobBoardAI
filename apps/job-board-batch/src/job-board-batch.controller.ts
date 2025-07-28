import { Controller, Get } from '@nestjs/common';
import { JobBoardBatchService } from './job-board-batch.service';

@Controller()
export class JobBoardBatchController {
  constructor(private readonly jobBoardBatchService: JobBoardBatchService) {}

  @Get()
  getHello(): string {
    return this.jobBoardBatchService.getHello();
  }
}
