import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import {
  EducationLevel,
  EmploymentLevel,
  JobLocation,
  JobStatus,
  JobType,
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
  positionTitle: string;

  @Field(() => Number)
  jobSalary: number;

  @Field(() => [String], { nullable: true })
  skillsRequired?: string[];

  @Field(() => Number)
  experienceYears: number;

  @Field(() => EducationLevel)
  educationLevel: EducationLevel;

  @Field(() => Int)
  jobViews: number;

  @Field(() => Int)
  jobLikes: number;

  @Field(() => Int)
  jobComments: number;

  @Field(() => Int)
  jobRank: number;

  @Field(() => [String], { nullable: true })
  jobImages?: string[];

  @Field(() => String)
  companyLogo: string;

  @Field(() => EmploymentLevel, { nullable: true })
  employmentLevel?: EmploymentLevel;

  @Field(() => String, { nullable: true })
  jobDesc?: string;

  @Field(() => String, { nullable: true })
  companyName?: string;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => Date, { nullable: true })
  closedAt?: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  /** Aggregation */
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
