import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { AuthModule } from './auth/auth.module';
// import { JobModule } from './property/property.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { FollowModule } from './follow/follow.module';
import { BoardArticleModule } from './board-article/board-article.module';

@Module({
  imports: [
    // JobModule,
    CommentModule,
    LikeModule,
    ViewModule,
    FollowModule,
    BoardArticleModule,
    MemberModule,
    AuthModule,
  ],
})
export class ComponentsModule {}

// TODO: Add when every module created
