import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Notification, Notifications, UnreadNotificationsCount } from '../../libs/dto/notification/notification';
import { 
  NotificationInquiry, 
  CreateNotificationInput, 
  UpdateNotificationInput,
  MarkNotificationsAsReadInput,
  DeleteNotificationsInput 
} from '../../libs/dto/notification/notification.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { lookupMember, lookupJob, lookupBoardArticle, shapeIntoMongooseObjectId } from '../../libs/config';
import { T } from '../../libs/types/common';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification') private readonly notificationModel: Model<Notification>,
  ) {}

    public async getNotifications(
    memberId: ObjectId,
    input: NotificationInquiry,
  ): Promise<Notifications> {
    const { page, limit, search, sort = 'createdAt', direction = Direction.DESC } = input;
    
    // Ensure sort field is valid
    const validSortField = sort && ['createdAt', 'updatedAt'].includes(sort) ? sort : 'createdAt';
    const validDirection = direction === Direction.DESC ? -1 : 1;

    // Build match criteria
    const match: T = { receiverId: memberId };

    if (search?.authorId) match.authorId = search.authorId;
    if (search?.notificationType) match.notificationType = search.notificationType;
    if (search?.notificationStatus) match.notificationStatus = search.notificationStatus;
    if (search?.notificationGroup) match.notificationGroup = search.notificationGroup;
    if (search?.jobId) match.jobId = search.jobId;
    if (search?.articleId) match.articleId = search.articleId;
    if (search?.isRead !== undefined) {
      // Convert isRead boolean to notificationStatus
      match.notificationStatus = search.isRead ? NotificationStatus.WAIT : NotificationStatus.READ;
    }
    
    // Check if pagination is the issue
    const rawCount = await this.notificationModel.countDocuments(match).exec();
    const skipValue = (page - 1) * limit;
    let effectiveSkip = skipValue;
    
    if (skipValue >= rawCount) {
      // Adjust to page 1 to show results
      effectiveSkip = 0;
    }
    
    // Execute the aggregation pipeline
    try {
      const result = await this.notificationModel
        .aggregate([
          { $match: match },
          { $sort: { [validSortField]: validDirection } },
          {
            $facet: {
              list: [
                { $skip: effectiveSkip },
                { $limit: limit },
                {
                  $addFields: {
                    authorId: { 
                      $cond: [
                        { $ne: ['$authorId', null] },
                        { $toObjectId: '$authorId' },
                        null
                      ]
                    },
                    receiverId: { 
                      $cond: [
                        { $ne: ['$receiverId', null] },
                        { $toObjectId: '$receiverId' },
                        null
                      ]
                    },
                    jobId: { 
                      $cond: [
                        { $ne: ['$jobId', null] },
                        { $toObjectId: '$jobId' },
                        null
                      ]
                    },
                    articleId: { 
                      $cond: [
                        { $ne: ['$articleId', null] },
                        { $toObjectId: '$articleId' },
                        null
                      ]
                    },
                  },
                },
                {
                  $lookup: {
                    from: 'members',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'memberData',
                  },
                },
                {
                  $unwind: {
                    path: '$memberData',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $addFields: {
                    authorData: '$memberData',
                    senderData: '$memberData',
                    // Map backend fields to frontend expected fields
                    type: '$notificationType',
                    title: '$notificationTitle',
                    message: '$notificationDesc',
                    senderId: '$authorId',
                    recipientId: '$receiverId',
                    isRead: { $eq: ['$notificationStatus', NotificationStatus.READ] },
                    isActive: true,
                    readAt: { $cond: [{ $eq: ['$notificationStatus', NotificationStatus.READ] }, '$updatedAt', null] },
                    relatedEntityId: { $cond: [{ $ne: ['$jobId', null] }, '$jobId', '$articleId'] },
                    relatedEntityType: { $cond: [{ $ne: ['$jobId', null] }, 'JOB', 'ARTICLE'] },
                  },
                },
                {
                  $lookup: {
                    from: 'members',
                    localField: 'receiverId',
                    foreignField: '_id',
                    as: 'receiverData',
                  },
                },
                {
                  $unwind: {
                    path: '$receiverData',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $addFields: {
                    recipientData: '$receiverData',
                  },
                },
                lookupJob,
                {
                  $unwind: {
                    path: '$jobData',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                lookupBoardArticle,
                {
                  $unwind: {
                    path: '$articleData',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
              metaCounter: [{ $count: 'total' }],
            },
          },
        ])
        .exec();
      
      return result[0];
    } catch (error) {
      return {
        list: [],
        metaCounter: [{ total: 0 }],
      };
    }
  }

  public async getUnreadNotificationsCount(memberId: ObjectId): Promise<UnreadNotificationsCount> {
    const query = {
      receiverId: memberId,
      notificationStatus: NotificationStatus.WAIT,
    };
    
    const count = await this.notificationModel
      .countDocuments(query)
      .exec();

    return { count };
  }

  public async getNotificationById(
    memberId: ObjectId,
    notificationId: string,
  ): Promise<Notification> {
    const notification = await this.notificationModel
      .aggregate([
        {
          $match: {
            _id: shapeIntoMongooseObjectId(notificationId),
            receiverId: memberId.toString(),
          },
        },
        {
          $addFields: {
            authorId: { $toObjectId: '$authorId' },
            receiverId: { $toObjectId: '$receiverId' },
            jobId: { $toObjectId: '$jobId' },
            articleId: { $toObjectId: '$articleId' },
          },
        },
        lookupMember,
        {
          $unwind: {
            path: '$memberData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            authorData: '$memberData',
            senderData: '$memberData',
            // Map backend fields to frontend expected fields
            type: '$notificationType',
            title: '$notificationTitle',
            message: '$notificationDesc',
            senderId: '$authorId',
            recipientId: '$receiverId',
            isRead: { $eq: ['$notificationStatus', NotificationStatus.READ] },
            isActive: true,
            readAt: { $cond: [{ $eq: ['$notificationStatus', NotificationStatus.READ] }, '$updatedAt', null] },
            relatedEntityId: { $cond: [{ $ne: ['$jobId', null] }, '$jobId', '$articleId'] },
            relatedEntityType: { $cond: [{ $ne: ['$jobId', null] }, 'JOB', 'ARTICLE'] },
          },
        },
        {
          $lookup: {
            from: 'members',
            localField: 'receiverId',
            foreignField: '_id',
            as: 'receiverData',
          },
        },
        {
          $unwind: {
            path: '$receiverData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            recipientData: '$receiverData',
          },
        },
        lookupJob,
        {
          $unwind: {
            path: '$jobData',
            preserveNullAndEmptyArrays: true,
          },
        },
        lookupBoardArticle,
        {
          $unwind: {
            path: '$articleData',
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .exec();

    if (!notification || notification.length === 0) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }

    return notification[0];
  }

  public async createNotification(
    authorId: ObjectId,
    input: CreateNotificationInput,
  ): Promise<Notification> {
    try {
      const notificationData = {
        ...input,
        authorId: authorId.toString(),
        notificationStatus: NotificationStatus.WAIT,
      };

      const result = await this.notificationModel.create(notificationData);
      return result;
    } catch (err) {
      console.log('Error: NotificationService.createNotification:', err.message);
      throw new InternalServerErrorException(Message.CREATE_FAILED);
    }
  }

  public async updateNotification(
    memberId: ObjectId,
    input: UpdateNotificationInput,
  ): Promise<Notification> {
    const { _id, ...updateData } = input;
    const notificationId = shapeIntoMongooseObjectId(_id);

    const existingNotification = await this.notificationModel.findOne({
      _id: notificationId,
      receiverId: memberId.toString(),
    });

    if (!existingNotification) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }

    const result = await this.notificationModel
      .findByIdAndUpdate(notificationId, updateData, { new: true })
      .exec();

    if (!result) {
      throw new InternalServerErrorException(Message.UPDATE_FAILED);
    }

    return result;
  }

  public async markNotificationsAsRead(
    memberId: ObjectId,
    input: MarkNotificationsAsReadInput,
  ): Promise<boolean> {
    const { notificationIds } = input;

    if (!notificationIds || notificationIds.length === 0) {
      throw new BadRequestException('No notification IDs provided');
    }

    const objectIds = notificationIds.map(id => shapeIntoMongooseObjectId(id));

    const result = await this.notificationModel
      .updateMany(
        {
          _id: { $in: objectIds },
          receiverId: memberId.toString(),
        },
        {
          notificationStatus: NotificationStatus.READ,
          updatedAt: new Date(),
        }
      )
      .exec();

    return result.modifiedCount > 0;
  }

  public async deleteNotifications(
    memberId: ObjectId,
    input: DeleteNotificationsInput,
  ): Promise<boolean> {
    const { notificationIds } = input;

    if (!notificationIds || notificationIds.length === 0) {
      throw new BadRequestException('No notification IDs provided');
    }

    const objectIds = notificationIds.map(id => shapeIntoMongooseObjectId(id));

    const result = await this.notificationModel
      .deleteMany({
        _id: { $in: objectIds },
        receiverId: memberId.toString(),
      })
      .exec();

    return result.deletedCount > 0;
  }

  public async deleteNotificationByCriteria(
    authorId: string,
    receiverId: string,
    notificationType: string,
    relatedEntityId?: string,
    relatedEntityType?: string,
  ): Promise<boolean> {
    const criteria: any = {
      authorId: authorId,
      receiverId: receiverId,
      notificationType: notificationType,
    };

    if (relatedEntityId) {
      if (relatedEntityType === 'JOB') {
        criteria.jobId = relatedEntityId;
      } else if (relatedEntityType === 'ARTICLE') {
        criteria.articleId = relatedEntityId;
      }
    }

    const result = await this.notificationModel
      .deleteMany(criteria)
      .exec();

    return result.deletedCount > 0;
  }

  public async markAllNotificationsAsRead(memberId: ObjectId): Promise<boolean> {
    const result = await this.notificationModel
      .updateMany(
        {
          receiverId: memberId.toString(),
          notificationStatus: NotificationStatus.WAIT,
        },
        {
          notificationStatus: NotificationStatus.READ,
          updatedAt: new Date(),
        }
      )
      .exec();

    return result.modifiedCount > 0;
  }
}
