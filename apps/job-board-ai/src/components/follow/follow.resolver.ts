import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { FollowService } from './follow.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Follower, Followers, Following, Followings } from '../../libs/dto/follow/follow';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { shapeIntoMongooseObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';

@Resolver()
export class FollowResolver {
	constructor(private readonly followService: FollowService) {}

	@UseGuards(AuthGuard)
	@Mutation((returns) => Follower)
	public async subscribe(@Args('memberId') memberId: string, @AuthMember('_id') followerId: ObjectId): Promise<Follower> {
		console.log('Mutation: subscribe');
		const followingId = shapeIntoMongooseObjectId(memberId);
		return await this.followService.subscribe(followerId, followingId);
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => Follower)
	public async unsubscribe(@Args('memberId') memberId: string, @AuthMember('_id') followerId: ObjectId): Promise<Follower> {
		console.log('Mutation: unSubscribe');
		const followingId: ObjectId = shapeIntoMongooseObjectId(memberId);
		return await this.followService.unsubscribe(followerId, followingId);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Followings)
	public async getMemberFollowings(
		@Args('input') input: FollowInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Followings> {
		console.log('Query: getMemberFollowings');
		const { followerId } = input.search;
		if (followerId && String(followerId).trim() !== '') {
			input.search.followerId = shapeIntoMongooseObjectId(followerId);
		}
		return await this.followService.getMemberFollowings(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Followers)
	public async getMemberFollowers(
		@Args('input') input: FollowInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Followers> {
		console.log('Query: getMemberFollowers');
		const { followingId } = input.search;
		if (followingId && String(followingId).trim() !== '') {
			input.search.followingId = shapeIntoMongooseObjectId(followingId);
		}
		return await this.followService.getMemberFollowers(memberId, input);
	}
}
