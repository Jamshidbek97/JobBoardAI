import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { FollowModule } from './follow/follow.module';
import { BoardArticleModule } from './board-article/board-article.module';
import { JobModule } from './job/job.module';
import { ApplicationModule } from './application/application.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    JobModule,
    CommentModule,
    LikeModule,
    ViewModule,
    FollowModule,
    BoardArticleModule,
    MemberModule,
    AuthModule,
    ApplicationModule,
    NotificationModule,
  ],
})
export class ComponentsModule {}

// TODO: Add when every module created
