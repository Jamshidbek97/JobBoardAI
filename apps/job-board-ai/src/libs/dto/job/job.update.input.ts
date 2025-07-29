import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, Length } from 'class-validator';
import {
  JobLocation,
  JobStatus,
  JobType,
  SalaryRange,
} from '../../enums/job.enum';

@InputType()
export class UpdateJobInput {
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
  companyName?: string;

  @IsOptional()
  @Length(3, 100)
  @Field(() => String, { nullable: true })
  positionTitle?: string;

  @IsOptional()
  @Field(() => SalaryRange, { nullable: true })
  salaryRange?: SalaryRange;

  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  companyLogo?: string[];

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  remote?: boolean;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  closedAt?: Date;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  archivedAt?: Date;
}
