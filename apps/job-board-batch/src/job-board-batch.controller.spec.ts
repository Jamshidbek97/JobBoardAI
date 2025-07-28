import { Test, TestingModule } from '@nestjs/testing';
import { JobBoardBatchController } from './job-board-batch.controller';
import { JobBoardBatchService } from './job-board-batch.service';

describe('JobBoardBatchController', () => {
  let jobBoardBatchController: JobBoardBatchController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [JobBoardBatchController],
      providers: [JobBoardBatchService],
    }).compile();

    jobBoardBatchController = app.get<JobBoardBatchController>(JobBoardBatchController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(jobBoardBatchController.getHello()).toBe('Hello World!');
    });
  });
});
