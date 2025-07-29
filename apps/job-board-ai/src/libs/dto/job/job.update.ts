import { Field, Int, InputType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { JobLocation, JobStatus, JobType } from '../../enums/job.enum';
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
  jobTitle?: string;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  jobPrice?: number;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  jobSquare?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Field(() => Int, { nullable: true })
  jobBeds?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Field(() => Int, { nullable: true })
  jobRooms?: number;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  jobImages?: string[];

  @IsOptional()
  @Length(5, 500)
  @Field(() => String, { nullable: true })
  jobDesc?: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  jobBarter?: boolean;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  jobRent: boolean;

  closedAt?: Date;

  deletedAt?: Date;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  constructedAt?: Date;
}
