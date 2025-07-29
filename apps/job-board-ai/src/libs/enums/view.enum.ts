import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
  MEMBER = 'MEMBER',
  ARTICLE = 'ARTICLE',
  JOB = 'JOB',
}
registerEnumType(ViewGroup, {
  name: 'ViewGroup',
});
