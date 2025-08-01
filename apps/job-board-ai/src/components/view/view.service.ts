import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';

import { ViewGroup } from '../../libs/enums/view.enum';
import { lookupVisit } from '../../libs/config';
import { OrdinaryInquiry } from '../../libs/dto/job/job.input';
import { Jobs } from '../../libs/dto/job/job';

@Injectable()
export class ViewService {
  constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

  public async recordView(input: ViewInput): Promise<View | null> {
    const viewExist = await this.checkViewExistence(input);
    if (!viewExist) {
      console.log('_New view inserted');
      return await this.viewModel.create(input);
    } else return null;
  }

  private async checkViewExistence(input: ViewInput): Promise<View> {
    const { memberId, viewRefId } = input;
    const search: T = { memberId: memberId, viewRefId: viewRefId };
    return await this.viewModel.findOne(search).exec();
  }

  public async getVisitedJobs(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Jobs> {
    const { page, limit } = input;
    const match: T = { viewGroup: ViewGroup.JOB, memberId: memberId };

    const data: T = await this.viewModel
      .aggregate([
        { $match: match },
        { $sort: { updatedAt: -1 } },
        {
          $lookup: {
            from: 'properties',
            localField: 'viewRefId',
            foreignField: '_id',
            as: 'visitedJob',
          },
        },
        { $unwind: '$visitedJob' },
        {
          $facet: {
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              lookupVisit,
              { $unwind: '$visitedJob.memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    console.log('Data', data);
    const result: Jobs = { list: [], metaCounter: data[0].metaCounter };
    result.list = data[0].list.map((ele) => ele.visitedJob);
    return result;
  }
}
