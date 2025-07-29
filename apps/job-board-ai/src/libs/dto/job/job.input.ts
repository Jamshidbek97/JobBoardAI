import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { JobLocation, JobStatus, JobType } from '../../enums/job.enum';
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

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	jobAddress: string;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	jobTitle: string;

	@IsNotEmpty()
	@Field(() => Number)
	jobPrice: number;

	@IsNotEmpty()
	@Field(() => Number)
	jobSquare: number;

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Field(() => Int)
	jobBeds: number;

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Field(() => Int)
	jobRooms: number;

	@IsNotEmpty()
	@Field(() => [String])
	jobImages: string[];

	@IsOptional()
	@Length(10, 100)
	@Field(() => String, { nullable: true })
	jobDesc?: string;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	jobBarter?: boolean;

	@Field(() => Boolean, { nullable: true })
	jobRent?: boolean;

	memberId: ObjectId;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	constructedAt?: Date;
}

@InputType()
export class PricesRange {
	@Field(() => Int)
	start: number;

	@Field(() => Int)
	end: number;
}

@InputType()
export class SquaresRange {
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
	@Field(() => [Int], { nullable: true })
	roomsList?: Number[];

	@IsOptional()
	@Field(() => [Int], { nullable: true })
	bedsList?: Number[];

	@IsOptional()
	@IsIn(availableJobOptions, { each: true })
	@Field(() => [String], { nullable: true })
	options?: string[];

	@IsOptional()
	@Field(() => PricesRange, { nullable: true })
	pricesRange?: PricesRange;

	@IsOptional()
	@Field(() => PeriodsRange, { nullable: true })
	periodsRange?: PeriodsRange;

	@IsOptional()
	@Field(() => SquaresRange, { nullable: true })
	squaresRange?: SquaresRange;

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
