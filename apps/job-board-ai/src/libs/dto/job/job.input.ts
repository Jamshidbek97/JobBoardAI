import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import {
  EducationLevel,
  EmploymentLevel,
  JobLocation,
  JobStatus,
  JobType,
} from '../../enums/job.enum';
import { ObjectId } from 'mongoose';
import { availableJobOptions, availableJobSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class JobInput {
  @IsNotEmpty()
  @Field(() => JobType)
  jobType: JobType;

  @IsNotEmpty()
  @Field(() => JobLocation)
  jobLocation: JobLocation;

  @IsOptional()
  @Length(3, 100)
  @Field(() => String, { nullable: true })
  jobAddress?: string;

  @IsNotEmpty()
  @Length(3, 100)
  @Field(() => String)
  companyName: string;

  @IsNotEmpty()
  @Length(3, 100)
  @Field(() => String)
  positionTitle: string;

  @IsNotEmpty()
  @Field(() => Number)
  jobSalary: number;

  @IsNotEmpty()
  @Field(() => Number)
  experienceYears: number;

  @IsNotEmpty()
  @Field(() => EducationLevel)
  educationLevel: EducationLevel;

  @IsNotEmpty()
  @Field(() => EmploymentLevel)
  employmentLevel: EmploymentLevel;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  skillsRequired?: string[];

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isRemote?: boolean;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  deadline?: Date;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  jobImages?: string[];

  @IsNotEmpty()
  @Field(() => String)
  companyLogo: string;

  @IsOptional()
  @Length(10, 1000)
  @Field(() => String, { nullable: true })
  jobDesc?: string;

  // Application-related fields
  @IsOptional()
  @Field(() => Date, { nullable: true })
  applicationDeadline?: Date;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  maxApplications?: number;

  memberId: ObjectId;
}

@InputType()
export class SalaryRange {
  @Field(() => Int)
  start: number;

  @Field(() => Int)
  end: number;
}

@InputType()
export class ExperienceRange {
  @Field(() => Int)
  start: number;

  @Field(() => Int)
  end: number;
}

@InputType()
export class PeriodsRange {
  @Field(() => Date)
  start: Date;

  @Field(() => Date)
  end: Date;
}

@InputType()
export class JISearch {
  @IsOptional()
  @Field(() => String, { nullable: true })
  memberId?: ObjectId;

  @IsOptional()
  @Field(() => [JobLocation], { nullable: true })
  locationList?: JobLocation[];

  @IsOptional()
  @Field(() => [JobType], { nullable: true })
  typeList?: JobType[];

  @IsOptional()
  @IsIn(availableJobOptions, { each: true })
  @Field(() => [String], { nullable: true })
  options?: string[];

  @IsOptional()
  @Field(() => SalaryRange, { nullable: true })
  salaryRange?: SalaryRange;

  @IsOptional()
  @Field(() => PeriodsRange, { nullable: true })
  periodsRange?: PeriodsRange;

  @IsOptional()
  @Field(() => ExperienceRange, { nullable: true })
  experienceRange?: ExperienceRange;

  @Field(() => [EducationLevel], { nullable: true })
  educationLevelList?: EducationLevel[];

  @IsOptional()
  @Field(() => [EmploymentLevel], { nullable: true })
  employmentLevels?: EmploymentLevel[];

  @IsOptional()
  @Field(() => [String], { nullable: true })
  skillsRequired?: string[];

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isRemote?: boolean;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class JobsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableJobSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction)
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => JISearch)
  search: JISearch;
}

@InputType()
class AJISearch {
  @IsOptional()
  @Field(() => JobStatus, { nullable: true })
  jobStatus?: JobStatus;
}

@InputType()
export class AgentJobsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableJobSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => AJISearch)
  search: AJISearch;
}

@InputType()
class ALJISearch {
  @IsOptional()
  @Field(() => JobStatus, { nullable: true })
  jobStatus?: JobStatus;

  @IsOptional()
  @Field(() => [JobLocation], { nullable: true })
  jobLocationList?: JobLocation[];
}

@InputType()
export class AllJobsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableJobSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => ALJISearch)
  search: ALJISearch;
}

@InputType()
export class OrdinaryInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;
}
