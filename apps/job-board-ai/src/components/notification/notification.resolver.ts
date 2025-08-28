import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { NotificationService } from './notification.service';
import { 
  Notification, 
  Notifications, 
  UnreadNotificationsCount 
} from '../../libs/dto/notification/notification';
import { 
  NotificationInquiry, 
  CreateNotificationInput, 
  UpdateNotificationInput,
  MarkNotificationsAsReadInput,
  DeleteNotificationsInput 
} from '../../libs/dto/notification/notification.input';

@Resolver()
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(AuthGuard)
  @Query(() => Notifications)
  public async getNotifications(
    @Args('input') input: NotificationInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Notifications> {
    console.log('Query: getNotifications');
    return await this.notificationService.getNotifications(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => UnreadNotificationsCount)
  public async getUnreadNotificationsCount(
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<UnreadNotificationsCount> {
    console.log('Query: getUnreadNotificationsCount');
    return await this.notificationService.getUnreadNotificationsCount(memberId);
  }

  @UseGuards(AuthGuard)
  @Query(() => Notification)
  public async getNotificationById(
    @Args('id') id: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Notification> {
    console.log('Query: getNotificationById');
    return await this.notificationService.getNotificationById(memberId, id);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Notification)
  public async createNotification(
    @Args('input') input: CreateNotificationInput,
    @AuthMember('_id') authorId: ObjectId,
  ): Promise<Notification> {
    console.log('Mutation: createNotification');
    return await this.notificationService.createNotification(authorId, input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Notification)
  public async updateNotification(
    @Args('input') input: UpdateNotificationInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Notification> {
    console.log('Mutation: updateNotification');
    return await this.notificationService.updateNotification(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async markNotificationsAsRead(
    @Args('input') input: MarkNotificationsAsReadInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<boolean> {
    console.log('Mutation: markNotificationsAsRead');
    return await this.notificationService.markNotificationsAsRead(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async deleteNotifications(
    @Args('input') input: DeleteNotificationsInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<boolean> {
    console.log('Mutation: deleteNotifications');
    return await this.notificationService.deleteNotifications(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async markAllNotificationsAsRead(
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<boolean> {
    console.log('Mutation: markAllNotificationsAsRead');
    return await this.notificationService.markAllNotificationsAsRead(memberId);
  }
}
