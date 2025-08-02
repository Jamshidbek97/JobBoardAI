import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';

import { LikeGroup } from '../../libs/enums/like.enum';
import { lookupFavorite } from '../../libs/config';
import { OrdinaryInquiry } from '../../libs/dto/job/job.input';
import { Jobs } from '../../libs/dto/job/job';

@Injectable()
export class LikeService {
  constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {}

  public async toggleLike(input: LikeInput): Promise<number> {
    const search: T = {
      memberId: input.memberId,
      likeRefId: input.likeRefId,
    };
    const exist = await this.likeModel.findOne(search).exec();
    let modifier = 1;
    if (exist) {
      await this.likeModel.findOneAndDelete(search).exec();
      modifier = -1;
    } else {
      try {
        await this.likeModel.create(input);
      } catch (err) {
        console.log('Error: ServiceModel', err);
        throw new BadRequestException(Message.CREATE_FAILED);
      }
    }
    console.log('- Like modifier: ', modifier, ' -');

    return modifier;
  }

  public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
    const { memberId, likeRefId } = input;
    const result = await this.likeModel
      .findOne({ memberId: memberId, likeRefId: likeRefId })
      .exec();

    return result
      ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }]
      : [];
  }

  public async getFavoriteJobs(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Jobs> {
    const { page, limit } = input;
    const match: T = { likeGroup: LikeGroup.JOB, memberId: memberId };

    const data: T = await this.likeModel
      .aggregate([
        { $match: match },
        { $sort: { updatedAt: -1 } },
        {
          $lookup: {
            from: 'jobs',
            localField: 'likeRefId',
            foreignField: '_id',
            as: 'favoriteJob',
          },
        },
        { $unwind: '$favoriteJob' },

        // STEP: Bring job's memberId to top level to use in lookup
        {
          $addFields: {
            memberIdForLookup: { $toObjectId: '$favoriteJob.memberId' },
          },
        },

        {
          $lookup: {
            from: 'members',
            localField: 'memberIdForLookup',
            foreignField: '_id',
            as: 'memberData',
          },
        },
        { $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },

        // STEP: Merge memberData into job
        {
          $addFields: {
            'favoriteJob.memberData': '$memberData',
          },
        },

        // Clean up if needed
        {
          $project: {
            memberIdForLookup: 0,
            memberData: 0,
          },
        },

        {
          $facet: {
            list: [{ $skip: (page - 1) * limit }, { $limit: limit }],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])

      .exec();
    console.log('Data', data);
    const result: Jobs = { list: [], metaCounter: data[0].metaCounter };
    result.list = data[0].list.map((ele) => ele.favoriteJob);
    return result;
  }
}
