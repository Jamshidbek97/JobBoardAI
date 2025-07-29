import { registerEnumType } from '@nestjs/graphql';

export enum LikeGroup {
  MEMBER = 'MEMBER',
  JOB = 'JOB',
  ARTICLE = 'ARTICLE',
}
registerEnumType(LikeGroup, {
  name: 'LikeGroup',
});
