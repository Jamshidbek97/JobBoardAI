import { Controller, Get, Logger } from '@nestjs/common';
import { NestarBatchService } from './batch.service';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { BATCH_ROLLBACK, BATCH_TOP_AGENTS, BATCH_TOP_JOBS } from './lib/config';

@Controller()
export class NestarBatchController {
  private logger: Logger = new Logger('batchController');
  constructor(private readonly batchService: NestarBatchService) {}

  @Timeout(1000)
  handleTImeout() {
    this.logger.debug('Batch server ready');
  }

  @Cron('00 00 01 * * *', { name: BATCH_ROLLBACK })
  public async batchRollback() {
    try {
      this.logger['context'] = BATCH_ROLLBACK;
      this.logger.debug('executed');
      await this.batchService.batchRollback();
    } catch (err) {
      this.logger.error(err);
    }
  }

  @Cron('20 00 01 * * *', { name: BATCH_TOP_JOBS })
  public async batchJobs() {
    try {
      this.logger['context'] = BATCH_TOP_JOBS;
      this.logger.debug('executed');
      await this.batchService.batchTopJobs();
    } catch (err) {
      this.logger.error(err);
    }
  }

  @Cron('40 00 01 * * *', { name: BATCH_TOP_AGENTS })
  public async batchAgents() {
    try {
      this.logger['context'] = BATCH_TOP_AGENTS;
      this.logger.debug('executed Agents');
      await this.batchService.batchTopAgents();
    } catch (err) {
      this.logger.error(err);
    }
  }

  // @Interval(1000)
  // handleInterval() {
  // 	this.logger.debug('Interval test');
  // }

  @Get()
  getHello(): string {
    return this.batchService.getHello();
  }
}
