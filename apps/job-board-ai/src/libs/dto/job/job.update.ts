import { Field, Int, InputType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import {
  EducationLevel,
  EmploymentLevel,
  JobLocation,
  JobStatus,
  JobType,
} from '../../enums/job.enum';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';

@InputType()
export class JobUpdate {
  @IsNotEmpty()
  @Field(() => String)
  _id: ObjectId;

  @IsOptional()
  @Field(() => JobType, { nullable: true })
  jobType?: JobType;

  @IsOptional()
  @Field(() => JobStatus, { nullable: true })
  jobStatus?: JobStatus;

  @IsOptional()
  @Field(() => JobLocation, { nullable: true })
  jobLocation?: JobLocation;

  @IsOptional()
  @Length(3, 100)
  @Field(() => String, { nullable: true })
  jobAddress?: string;

  @IsOptional()
  @Length(3, 100)
  @Field(() => String, { nullable: true })
  positionTitle?: string;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  jobSalary?: number;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  skillsRequired?: string[];

  @IsOptional()
  @Field(() => Number, { nullable: true })
  experienceYears?: number;

  @Field(() => EducationLevel, { nullable: true })
  educationLevel?: EducationLevel;

  @IsOptional()
  @Field(() => EmploymentLevel, { nullable: true })
  employmentLevel?: EmploymentLevel;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  jobImages?: string[];

  @IsOptional()
  @Field(() => String, { nullable: true })
  companyLogo?: string;

  @IsOptional()
  @Length(5, 500)
  @Field(() => String, { nullable: true })
  jobDesc?: string;

  closedAt?: Date;

  deletedAt?: Date;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  constructedAt?: Date;
}
