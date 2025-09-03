import { Field, ObjectType, Int } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { ApplicationStatus } from '../../../schemas/Application.model';
import { Member, TotalCounter } from '../member/member';
import { Job } from '../job/job';

@ObjectType()
export class Application {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  jobId: string;

  @Field(() => String)
  applicantId: string;

  @Field(() => String)
  companyId: string;

  @Field(() => ApplicationStatus)
  status: ApplicationStatus;

  @Field(() => Date)
  appliedAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  coverLetter?: string;

  @Field(() => String, { nullable: true })
  resumeUrl?: string;

  @Field(() => [String], { nullable: true })
  additionalDocuments?: string[];

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => Date, { nullable: true })
  interviewDate?: Date;

  @Field(() => String, { nullable: true })
  feedback?: string;

  @Field(() => Boolean)
  isActive: boolean;

  // Additional fields
  @Field(() => Number)
  expectedSalary: number;

  @Field(() => String, { nullable: true })
  availabilityDate?: string;

  @Field(() => Boolean)
  isRemotePreferred: boolean;

  @Field(() => String, { nullable: true })
  relevantExperience?: string;

  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Field(() => String, { nullable: true })
  currentPosition?: string;

  @Field(() => String, { nullable: true })
  currentCompany?: string;

  @Field(() => Number, { nullable: true })
  yearsOfExperience?: number;

  @Field(() => String, { nullable: true })
  preferredWorkSchedule?: string;

  @Field(() => Boolean)
  isRelocationWilling: boolean;

  @Field(() => String, { nullable: true })
  relocationLocation?: string;

  @Field(() => Date, { nullable: true })
  earliestStartDate?: Date;

  @Field(() => String, { nullable: true })
  motivation?: string;

  @Field(() => [String], { nullable: true })
  references?: string[];

  @Field(() => String, { nullable: true })
  applicationSource?: string;

  @Field(() => Boolean)
  isViewedByCompany: boolean;

  @Field(() => Date, { nullable: true })
  viewedAt?: Date;

  @Field(() => Number)
  viewCount: number;

  @Field(() => Date)
  createdAt: Date;

  // Aggregated data
  @Field(() => Job, { nullable: true })
  jobData?: Job;

  @Field(() => Member, { nullable: true })
  applicantData?: Member;

  @Field(() => Member, { nullable: true })
  companyData?: Member;
}

@ObjectType()
export class Applications {
  @Field(() => [Application])
  list: Application[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}

@ObjectType()
export class ApplicationStats {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  pending: number;

  @Field(() => Int)
  reviewing: number;

  @Field(() => Int)
  accepted: number;

  @Field(() => Int)
  rejected: number;

  @Field(() => Int)
  withdrawn: number;
}
