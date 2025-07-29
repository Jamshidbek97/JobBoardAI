import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import {
  JobLocation,
  JobStatus,
  JobType,
  SalaryRange,
} from '../../enums/job.enum';
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

@ObjectType()
export class Job {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => JobType)
  jobType: JobType;

  @Field(() => JobStatus)
  jobStatus: JobStatus;

  @Field(() => JobLocation)
  jobLocation: JobLocation;

  @Field(() => String)
  companyName: string;

  @Field(() => String)
  positionTitle: string;

  @Field(() => SalaryRange)
  salaryRange: SalaryRange;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  companyLogo?: string[];

  @Field(() => Int)
  jobViews: number;

  @Field(() => Int)
  jobLikes: number;

  @Field(() => Int)
  jobComments: number;

  @Field(() => Int)
  jobRank: number;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => Date, { nullable: true })
  closedAt?: Date;

  @Field(() => Date, { nullable: true })
  archivedAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Member, { nullable: true })
  memberData?: Member;

  @Field(() => [MeLiked], { nullable: true })
  meLiked?: MeLiked[];
}

@ObjectType()
export class Jobs {
  @Field(() => [Job])
  list: Job[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}
