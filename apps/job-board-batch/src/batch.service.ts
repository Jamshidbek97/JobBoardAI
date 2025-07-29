import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/job-board-ai/src/libs/dto/member/member';
import { JobStatus } from 'apps/job-board-ai/src/libs/enums/job.enum';
import {
  MemberStatus,
  MemberType,
} from 'apps/job-board-ai/src/libs/enums/member.enum';
import { Job } from 'apps/job-board-ai/src/schemas/job.model';

import { Model } from 'mongoose';

@Injectable()
export class NestarBatchService {
  constructor(
    @InjectModel('Job') private readonly jobModel: Model<Job>,
    @InjectModel('Member') private readonly memberModel: Model<Member>,
  ) {}
  public async batchRollback(): Promise<void> {
    await this.jobModel
      .updateMany(
        {
          jobStatus: JobStatus.OPEN,
        },
        { jobRank: 0 },
      )
      .exec();

    await this.memberModel
      .updateMany(
        {
          memberStatus: MemberStatus.ACTIVE,
          memberTypeS: MemberType.AGENT,
        },
        { memberRank: 0 },
      )
      .exec();
    console.log('batchRollback');
  }

  public async batchTopProperties(): Promise<void> {
    const properties: Job[] = await this.jobModel
      .find({
        jobStatus: JobStatus.OPEN,
        jobRank: 0,
      })
      .exec();

    const promisedList = properties.map(async (ele: Job) => {
      const { _id, jobLikes, jobViews } = ele;
      const rank = jobLikes * 2 + jobViews * 1;
      return await this.jobModel.findByIdAndUpdate(_id, { JobRank: rank });
    });

    await Promise.all(promisedList);
  }

  public async batchTopAgents(): Promise<void> {
    const agents: Member[] = await this.memberModel
      .find({
        memberType: MemberType.AGENT,
        memberStatus: MemberStatus.ACTIVE,
        memberRank: 0,
      })
      .exec();

    const promisedList = agents.map(async (ele: Member) => {
      const {
        _id,
        memberProperties,
        memberViews,
        memberLikes,
        memberArticles,
      } = ele;
      const rank =
        memberProperties * 4 +
        memberArticles * 3 +
        memberLikes * 2 +
        memberViews * 1;

      return await this.memberModel.findByIdAndUpdate(_id, {
        memberRank: rank,
      });
    });

    await Promise.all(promisedList);
  }

  getHello(): string {
    return 'Hello World batch !';
  }
}
