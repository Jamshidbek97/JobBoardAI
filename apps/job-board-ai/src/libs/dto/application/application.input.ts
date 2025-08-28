import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsNumber, IsString, IsBoolean, IsArray, Min, MaxLength } from 'class-validator';
import { ApplicationStatus } from '../../../schemas/Application.model';
import { Direction } from '../../enums/common.enum';

@InputType()
export class ApplicationInput {
  @IsNotEmpty()
  @Field(() => String)
  jobId: string;

  @IsNotEmpty()
  @Field(() => Number)
  @Min(0)
  expectedSalary: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @MaxLength(2000)
  coverLetter?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  resumeUrl?: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  additionalDocuments?: string[];

  @IsOptional()
  @Field(() => String, { nullable: true })
  @MaxLength(500)
  availabilityDate?: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isRemotePreferred?: boolean;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @MaxLength(500)
  relevantExperience?: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  skills?: string[];

  @IsOptional()
  @Field(() => String, { nullable: true })
  @MaxLength(200)
  currentPosition?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @MaxLength(200)
  currentCompany?: string;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  @Min(0)
  yearsOfExperience?: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @MaxLength(100)
  preferredWorkSchedule?: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isRelocationWilling?: boolean;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @MaxLength(200)
  relocationLocation?: string;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  earliestStartDate?: Date;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @MaxLength(500)
  motivation?: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  references?: string[];

  @IsOptional()
  @Field(() => String, { nullable: true })
  @MaxLength(100)
  applicationSource?: string;
}

@InputType()
export class ApplicationUpdate {
  @IsNotEmpty()
  @Field(() => String)
  _id: string;

  @IsOptional()
  @Field(() => ApplicationStatus, { nullable: true })
  status?: ApplicationStatus;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  interviewDate?: Date;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @MaxLength(1000)
  feedback?: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isViewedByCompany?: boolean;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  @Min(0)
  expectedSalary?: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  @MaxLength(2000)
  coverLetter?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  resumeUrl?: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  additionalDocuments?: string[];
}

@InputType()
export class ApplicationSearch {
  @IsOptional()
  @Field(() => String, { nullable: true })
  jobId?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  applicantId?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  companyId?: string;

  @IsOptional()
  @Field(() => ApplicationStatus, { nullable: true })
  status?: ApplicationStatus;

  @IsOptional()
  @Field(() => [ApplicationStatus], { nullable: true })
  statusList?: ApplicationStatus[];

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isViewedByCompany?: boolean;
}

@InputType()
export class ApplicationsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => ApplicationSearch)
  search: ApplicationSearch;
}

@InputType()
export class ApplicationStats {
  @Field(() => Number)
  total: number;

  @Field(() => Number)
  pending: number;

  @Field(() => Number)
  reviewing: number;

  @Field(() => Number)
  accepted: number;

  @Field(() => Number)
  rejected: number;

  @Field(() => Number)
  withdrawn: number;
}
