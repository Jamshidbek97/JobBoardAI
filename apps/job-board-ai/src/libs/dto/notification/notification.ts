import { Field, ObjectType, Int } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { NotificationType, NotificationStatus, NotificationGroup } from '../../enums/notification.enum';
import { Member } from '../member/member';
import { Job } from '../job/job';
import { BoardArticle } from '../board-article/board-article';
import { TotalCounter } from '../member/member';

@ObjectType()
export class Notification {
  @Field(() => String)
  _id: ObjectId;

  // Frontend expects these field names
  @Field(() => NotificationType)
  type: NotificationType;

  @Field(() => NotificationStatus)
  notificationStatus: NotificationStatus;

  @Field(() => NotificationGroup)
  notificationGroup: NotificationGroup;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => String)
  senderId: ObjectId;

  @Field(() => String)
  recipientId: ObjectId;

  @Field(() => String, { nullable: true })
  relatedEntityId?: ObjectId;

  @Field(() => String, { nullable: true })
  relatedEntityType?: string;

  @Field(() => Boolean)
  isRead: boolean;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  readAt?: Date;

  // Backend field names (for compatibility)
  @Field(() => NotificationType)
  notificationType: NotificationType;

  @Field(() => String)
  notificationTitle: string;

  @Field(() => String, { nullable: true })
  notificationDesc?: string;

  @Field(() => String)
  authorId: ObjectId;

  @Field(() => String)
  receiverId: ObjectId;

  @Field(() => String, { nullable: true })
  jobId?: ObjectId;

  @Field(() => String, { nullable: true })
  articleId?: ObjectId;

  // Aggregated data
  @Field(() => Member, { nullable: true })
  senderData?: Member;

  @Field(() => Member, { nullable: true })
  recipientData?: Member;

  @Field(() => Member, { nullable: true })
  authorData?: Member;

  @Field(() => Member, { nullable: true })
  receiverData?: Member;

  @Field(() => Job, { nullable: true })
  jobData?: Job;

  @Field(() => BoardArticle, { nullable: true })
  articleData?: BoardArticle;
}

@ObjectType()
export class Notifications {
  @Field(() => [Notification])
  list: Notification[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}

@ObjectType()
export class UnreadNotificationsCount {
  @Field(() => Int)
  count: number;
}
