import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Follower, Followers, Following, Followings } from '../../libs/dto/follow/follow';
import { MemberService } from '../member/member.service';
import { Direction, Message } from '../../libs/enums/common.enum';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';
import { T } from '../../libs/types/common';
import {
	lookupAuhMemberFollowed,
	lookupAuhMemberLiked,
	lookupFollowerData,
	lookupFollowingData,
} from '../../libs/config';

@Injectable()
export class FollowService {
	constructor(
		@InjectModel('Follow') private readonly followModel: Model<Follower | Following>,
		private readonly memberService: MemberService,
	) {}

	public async subscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		if (followingId.toString() === followerId.toString()) {
			throw new InternalServerErrorException(Message.SELF_SUBSCRIPTION_DENIED);
		}

		const targetMember = await this.memberService.getMember(null, followingId);
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		// Check if subscription already exists
		const existingSubscription = await this.followModel.findOne({ 
			followerId: followerId, 
			followingId: followingId 
		}).exec();
		
		if (existingSubscription) {
			throw new BadRequestException(Message.ALREADY_SUBSCRIBED);
		}

		const result = await this.registerSubscription(followerId, followingId);

		await this.memberService.memberStatsEditor({ _id: followerId, targetKey: 'memberFollowings', modifier: 1 });
		await this.memberService.memberStatsEditor({ _id: followingId, targetKey: 'memberFollowers', modifier: 1 });

		return result;
	}

	private async registerSubscription(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		try {
			return await this.followModel.create({ followingId: followingId, followerId: followerId });
		} catch (err) {
			console.log('Error: Service.model', err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async unsubscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		const targetMember = await this.memberService.getMember(null, followingId);
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const result = await this.followModel.findOneAndDelete({ 
			followerId: followerId, 
			followingId: followingId 
		}).exec();
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		await this.memberService.memberStatsEditor({ _id: followerId, targetKey: 'memberFollowings', modifier: -1 });
		await this.memberService.memberStatsEditor({ _id: followingId, targetKey: 'memberFollowers', modifier: -1 });

		return result;
	}

	public async getMemberFollowings(memberId: ObjectId, input: FollowInquiry): Promise<Followings> {
		const { page, limit, search } = input;
		if (!search?.followerId) throw new InternalServerErrorException(Message.BAD_REQUEST);

		const match: T = { followerId: search?.followerId };
		console.log('Match', match);

		const result = await this.followModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: Direction.DESC } },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupAuhMemberLiked(memberId, '$followingId'),
							lookupAuhMemberFollowed({ followerId: memberId, followingId: '$followingId' }),
							lookupFollowingData,
							{ $unwind: { path: '$followingData', preserveNullAndEmptyArrays: true } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result[0]) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async getMemberFollowers(memberId: ObjectId, input: FollowInquiry): Promise<Followers> {
		const { page, limit, search } = input;
		if (!search?.followingId) throw new InternalServerErrorException(Message.BAD_REQUEST);

		const match: T = { followingId: search?.followingId };
		console.log('Match', match);

		const result = await this.followModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: Direction.DESC } },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupAuhMemberLiked(memberId, '$followerId'),
							lookupAuhMemberFollowed({ followerId: memberId, followingId: '$followingId' }),
							lookupFollowerData,
							{ $unwind: { path: '$followerData', preserveNullAndEmptyArrays: true } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result[0]) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}
}
