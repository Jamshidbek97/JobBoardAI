import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { JobLocation, JobType, SalaryRange } from '../../enums/job.enum';

@InputType()
export class JobSearchInput {
  @IsOptional()
  @Field(() => [JobLocation], { nullable: true })
  locations?: JobLocation[];

  @IsOptional()
  @Field(() => [JobType], { nullable: true })
  jobTypes?: JobType[];

  @IsOptional()
  @Field(() => String, { nullable: true })
  keyword?: string;

  @IsOptional()
  @Field(() => SalaryRange, { nullable: true })
  salaryRange?: SalaryRange;
}