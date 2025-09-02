import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Comment, Comments } from '../../libs/dto/comment/comment';
import { MemberService } from '../member/member.service';
import { BoardArticleService } from '../board-article/board-article.service';
import {
  CommentInput,
  CommentsInquiry,
} from '../../libs/dto/comment/comment.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { T } from '../../libs/types/common';
import { lookupMember, lookupJob, lookupBoardArticle, shapeIntoMongooseObjectId } from '../../libs/config';
import { JobService } from '../job/job.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, NotificationGroup } from '../../libs/enums/notification.enum';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment') private readonly commentModel: Model<Comment>,
    private readonly memberService: MemberService,
    private readonly jobService: JobService,
    private readonly boardArticleService: BoardArticleService,
    private readonly notificationService: NotificationService,
  ) {}

  public async createComment(
    memberId: ObjectId,
    input: CommentInput,
  ): Promise<Comment> {
    input.memberId = memberId;
    let result = null;
    try {
      result = await this.commentModel.create(input);
    } catch (err) {
      console.log('Error: ServiceModel:', err.message);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
    switch (input.commentGroup) {
      case CommentGroup.JOB:
        await this.jobService.jobStatsEditor({
          _id: input.commentRefId,
          targetKey: 'JobComments',
          modifier: 1,
        });
        break;
      case CommentGroup.ARTICLE:
        await this.boardArticleService.boardArticleStatsEditor({
          _id: input.commentRefId,
          targetKey: 'articleComments',
          modifier: 1,
        });
        break;
      case CommentGroup.MEMBER:
        await this.memberService.memberStatsEditor({
          _id: input.commentRefId,
          targetKey: 'memberComments',
          modifier: 1,
        });
        break;
    }
    if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

    // Create notification for comment
    await this.createCommentNotification(memberId, input);

    return result;
  }

  public async updateComment(
    memberId: ObjectId,
    input: CommentUpdate,
  ): Promise<Comment> {
    const { _id } = input;
    const result = await this.commentModel
      .findOneAndUpdate(
        { _id: _id, memberId: memberId, commentStatus: CommentStatus.ACTIVE },
        input,
        {
          new: true,
        },
      )
      .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    return result;
  }

  public async getComments(
    memberId: ObjectId,
    input: CommentsInquiry,
  ): Promise<Comments> {
    const { commentRefId } = input.search;

    const match: T = {
      commentRefId: commentRefId,
      commentStatus: CommentStatus.ACTIVE,
    };
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };

    const result: Comments[] = await this.commentModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              // is liked
              lookupMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }

    return result[0];
  }
  public async removeCommentByAdmin(input: ObjectId): Promise<Comment> {
    const result = await this.commentModel.findByIdAndDelete(input);
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
    console.log('Deleted Comment:', result);
    return result;
  }

  private async createCommentNotification(
    memberId: ObjectId,
    commentInput: CommentInput,
  ): Promise<void> {
    try {
      let notificationTitle = '';
      let notificationGroup = '';
      let relatedEntityId = '';

      switch (commentInput.commentGroup) {
        case CommentGroup.MEMBER:
          notificationTitle = 'Someone commented on your profile!';
          notificationGroup = NotificationGroup.MEMBER;
          relatedEntityId = commentInput.commentRefId;
          break;
        case CommentGroup.JOB:
          notificationTitle = 'Someone commented on your job posting!';
          notificationGroup = NotificationGroup.JOB;
          relatedEntityId = commentInput.commentRefId;
          break;
        case CommentGroup.ARTICLE:
          notificationTitle = 'Someone commented on your article!';
          notificationGroup = NotificationGroup.ARTICLE;
          relatedEntityId = commentInput.commentRefId;
          break;
      }

      await this.notificationService.createNotification(
        memberId, // authorId (who commented)
        {
          notificationType: NotificationType.COMMENT,
          notificationGroup: notificationGroup,
          notificationTitle,
          notificationDesc: 'You received a new comment!',
          receiverId: commentInput.commentRefId, // who was commented on
          ...(commentInput.commentGroup === CommentGroup.JOB && { jobId: commentInput.commentRefId }),
          ...(commentInput.commentGroup === CommentGroup.ARTICLE && { articleId: commentInput.commentRefId }),
        }
      );
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }
}
