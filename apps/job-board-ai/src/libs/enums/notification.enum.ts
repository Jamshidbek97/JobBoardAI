import { registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  APPLICATION = 'APPLICATION',
  APPLICATION_STATUS = 'APPLICATION_STATUS',
}
registerEnumType(NotificationType, {
  name: 'NotificationType',
});

export enum NotificationStatus {
  WAIT = 'WAIT',
  READ = 'READ',
}
registerEnumType(NotificationStatus, {
  name: 'NotificationStatus',
});

export enum NotificationGroup {
  MEMBER = 'MEMBER',
  ARTICLE = 'ARTICLE',
  JOB = 'JOB',
  APPLICATION = 'APPLICATION',
}
registerEnumType(NotificationGroup, {
  name: 'NotificationGroup',
});
