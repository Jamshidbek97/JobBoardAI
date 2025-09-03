import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min, IsEnum, IsString, IsArray } from 'class-validator';
import { NotificationType, NotificationStatus, NotificationGroup } from '../../enums/notification.enum';
import { Direction } from '../../enums/common.enum';

@InputType()
class NotificationSearch {
  @IsOptional()
  @Field(() => String, { nullable: true })
  authorId?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  receiverId?: string;

  @IsOptional()
  @Field(() => NotificationType, { nullable: true })
  notificationType?: NotificationType;

  @IsOptional()
  @Field(() => NotificationStatus, { nullable: true })
  notificationStatus?: NotificationStatus;

  @IsOptional()
  @Field(() => NotificationGroup, { nullable: true })
  notificationGroup?: NotificationGroup;

  @IsOptional()
  @Field(() => String, { nullable: true })
  jobId?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  articleId?: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isRead?: boolean;
}

@InputType()
export class NotificationInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsOptional()
  @Field(() => NotificationSearch, { nullable: true })
  search?: NotificationSearch;
}

@InputType()
export class CreateNotificationInput {
  @IsNotEmpty()
  @IsEnum(NotificationType)
  @Field(() => NotificationType)
  notificationType: NotificationType;

  @IsNotEmpty()
  @IsEnum(NotificationGroup)
  @Field(() => NotificationGroup)
  notificationGroup: NotificationGroup;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  notificationTitle: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  notificationDesc?: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  receiverId: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  jobId?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  articleId?: string;
}

@InputType()
export class UpdateNotificationInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  _id: string;

  @IsOptional()
  @IsEnum(NotificationStatus)
  @Field(() => NotificationStatus, { nullable: true })
  notificationStatus?: NotificationStatus;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  notificationTitle?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  notificationDesc?: string;
}

@InputType()
export class MarkNotificationsAsReadInput {
  @IsNotEmpty()
  @IsArray()
  @Field(() => [String])
  notificationIds: string[];
}

@InputType()
export class DeleteNotificationsInput {
  @IsNotEmpty()
  @IsArray()
  @Field(() => [String])
  notificationIds: string[];
}
