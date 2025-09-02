import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, NotificationGroup } from '../../libs/enums/notification.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { lookupFavorite } from '../../libs/config';
import { OrdinaryInquiry } from '../../libs/dto/job/job.input';
import { Jobs } from '../../libs/dto/job/job';

@Injectable()
export class LikeService {
  constructor(
    @InjectModel('Like') private readonly likeModel: Model<Like>,
    private readonly notificationService: NotificationService,
  ) {}

  public async toggleLike(input: LikeInput): Promise<number> {
    const search: T = {
      memberId: input.memberId,
      likeRefId: input.likeRefId,
      likeGroup: input.likeGroup,
    };
    
    const exist = await this.likeModel.findOne(search).exec();
    let modifier = 1;
    
    if (exist) {
      // Unlike - remove like and delete notification
      await this.likeModel.findOneAndDelete(search).exec();
      modifier = -1;
      
      // Delete the like notification
      await this.deleteLikeNotification(input);
    } else {
      // Like - create like and notification
      try {
        await this.likeModel.create(input);
        
        // Create notification based on like type
        await this.createLikeNotification(input);
      } catch (err) {
        console.log('Error: ServiceModel', err.message);
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

  private async createLikeNotification(likeInput: LikeInput): Promise<void> {
    try {
      let notificationTitle = '';
      let notificationGroup: NotificationGroup;

      switch (likeInput.likeGroup) {
        case LikeGroup.MEMBER:
          notificationTitle = 'Someone liked your profile!';
          notificationGroup = NotificationGroup.MEMBER;
          break;
        case LikeGroup.JOB:
          notificationTitle = 'Someone liked your job posting!';
          notificationGroup = NotificationGroup.JOB;
          break;
        case LikeGroup.ARTICLE:
          notificationTitle = 'Someone liked your article!';
          notificationGroup = NotificationGroup.ARTICLE;
          break;
      }

      await this.notificationService.createNotification(
        likeInput.memberId, // authorId (who liked)
        {
          notificationType: NotificationType.LIKE,
          notificationGroup: NotificationGroup.MEMBER,
          notificationTitle,
          notificationDesc: 'You received a new like!',
          receiverId: likeInput.likeRefId.toString(), // who was liked
          ...(likeInput.likeGroup === LikeGroup.JOB && { jobId: likeInput.likeRefId.toString() }),
          ...(likeInput.likeGroup === LikeGroup.ARTICLE && { articleId: likeInput.likeRefId.toString() }),
        }
      );
    } catch (error) {
      console.error('Failed to create notification:', error);
      // Don't throw error - notification failure shouldn't break like functionality
    }
  }

  private async deleteLikeNotification(likeInput: LikeInput): Promise<void> {
    try {
      let relatedEntityType: string;
      
      switch (likeInput.likeGroup) {
        case LikeGroup.JOB:
          relatedEntityType = 'JOB';
          break;
        case LikeGroup.ARTICLE:
          relatedEntityType = 'ARTICLE';
          break;
        case LikeGroup.MEMBER:
          relatedEntityType = 'MEMBER';
          break;
      }

      await this.notificationService.deleteNotificationByCriteria(
        likeInput.memberId.toString(), // authorId (who liked)
        likeInput.likeRefId.toString(), // receiverId (who was liked)
        NotificationType.LIKE,
        likeInput.likeRefId.toString(), // relatedEntityId
        relatedEntityType
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Don't throw error - notification failure shouldn't break like functionality
    }
  }
}
