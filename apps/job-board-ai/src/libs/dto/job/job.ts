import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { JobLocation, JobStatus, JobType } from '../../enums/job.enum';
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
	jobAddress: string;

	@Field(() => String)
	jobTitle: string;

	@Field(() => Number)
	jobPrice: number;

	@Field(() => Number)
	jobSquare: number;

	@Field(() => Int)
	jobBeds: number;

	@Field(() => Int)
	jobRooms: number;

	@Field(() => Int)
	jobViews: number;

	@Field(() => Int)
	jobLikes: number;

	@Field(() => Int)
	jobComments: number;

	@Field(() => Int)
	jobRank: number;

	@Field(() => [String])
	jobImages: string[];

	@Field(() => String, { nullable: true })
	jobDesc?: string;

	@Field(() => Boolean)
	jobBarter: boolean;

	@Field(() => Boolean)
	jobRent: boolean;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date, { nullable: true })
	soldAt?: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date, { nullable: true })
	constructedAt?: Date;

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
