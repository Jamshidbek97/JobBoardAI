import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ObjectId } from 'mongodb';
import { JobType, JobLocation, SalaryRange } from '../../enums/job.enum';

@InputType()
export class JobInput {
  @IsNotEmpty()
  @Field(() => JobType)
  jobType: JobType;

  @IsNotEmpty()
  @Field(() => JobLocation)
  jobLocation: JobLocation;

  @IsNotEmpty()
  @Length(3, 100)
  @Field(() => String)
  companyName: string;

  @IsNotEmpty()
  @Length(3, 100)
  @Field(() => String)
  positionTitle: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string;

  @IsNotEmpty()
  @Field(() => SalaryRange)
  salaryRange: SalaryRange;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  publishedAt?: Date;

  @Field(() => Boolean, { nullable: true })
  remote?: boolean;

  memberId: ObjectId;
}