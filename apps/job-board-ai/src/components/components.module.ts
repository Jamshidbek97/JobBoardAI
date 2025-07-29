import { Module } from '@nestjs/common';
// import { MemberModule } from './member/member.module';
// import { JobModule } from './property/property.module';
// import { AuthModule } from './auth/auth.module';
// import { CommentModule } from './comment/comment.module';
// import { LikeModule } from './like/like.module';
// import { ViewModule } from './view/view.module';
// import { FollowModule } from './follow/follow.module';
// import { BoardArticleModule } from './board-article/board-article.module';
import { MemberModule } from './member/member.module';

@Module({
  imports: [
    // MemberModule,
    // JobModule,
    // AuthModule,
    // CommentModule,
    // LikeModule,
    // ViewModule,
    // FollowModule,
    // BoardArticleModule,
  MemberModule],
})
export class ComponentsModule {}

// TODO: Add when every module created
