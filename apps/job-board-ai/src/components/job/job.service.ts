import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Jobs, Job } from '../../libs/dto/job/job';
import {
  AgentJobsInquiry,
  AllJobsInquiry,
  OrdinaryInquiry,
  JobsInquiry,
  JobInput,
} from '../../libs/dto/job/job.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { StatisticModifier, T } from '../../libs/types/common';
import { JobStatus } from '../../libs/enums/job.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import { JobUpdate } from '../../libs/dto/job/job.update';
import * as moment from 'moment';
import {
  lookupAuhMemberLiked,
  lookupMember,
  shapeIntoMongooseObjectId,
} from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';

@Injectable()
export class JobService {
  constructor(
    @InjectModel('Job') private readonly jobModel: Model<Job>,
    private readonly memberService: MemberService,
    private readonly viewService: ViewService,
    private readonly likeService: LikeService,
  ) {}

  public async createJob(input: JobInput): Promise<Job> {
    try {
     
      if (!input.memberId)
        throw new BadRequestException('Member ID is missing');
      const result = await await this.jobModel.create(input);
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: 'memberPostedJobs',
        modifier: 1,
      });
      console.log(result);

      return result;
    } catch (err) {
      console.log('Err, Job service model: ', err.message);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async getJob(memberId: ObjectId, jobId: ObjectId): Promise<Job> {
    const search: T = {
      _id: jobId,
      jobStatus: JobStatus.OPEN,
    };

    const targetJob: Job = await this.jobModel.findOne(search).lean().exec();

    if (!targetJob)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    if (memberId) {
      const viewInput = {
        memberId: memberId,
        viewRefId: jobId,
        viewGroup: ViewGroup.JOB,
      };
      const newView = await this.viewService.recordView(viewInput);
      if (newView) {
        await this.jobStatsEditor({
          _id: jobId,
          targetKey: 'jobViews',
          modifier: 1,
        });
        targetJob.jobViews++;
      }
      const likeInput = {
        memberId: memberId,
        likeRefId: jobId,
        likeGroup: LikeGroup.JOB,
      };
      targetJob.meLiked = await this.likeService.checkLikeExistence(likeInput);
    }

    targetJob.memberData = await this.memberService.getMember(
      null,
      targetJob.memberId,
    );

    return targetJob;
  }

  public async updateJob(memberId: ObjectId, input: JobUpdate): Promise<Job> {
    let { jobStatus, closedAt, deletedAt, _id } = input;
    const search: T = {
      _id: _id,
      memberId: memberId.toString(), // Convert ObjectId to string since memberId is stored as string
      jobStatus: JobStatus.OPEN,
    };

    if (jobStatus === JobStatus.CLOSED) closedAt = moment().toDate();
    else if (jobStatus === JobStatus.DELETE) deletedAt = moment().toDate();

    const result = await this.jobModel
      .findOneAndUpdate(search, input, { new: true })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (closedAt || deletedAt) {
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: 'memberPostedJobs',
        modifier: -1,
      });
    }

    return result;
  }

  public async getJobs(memberId: ObjectId, input: JobsInquiry): Promise<Jobs> {
    const match: T = { jobStatus: JobStatus.OPEN };
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };

    this.shapeMatchQuery(match, input);
    console.log('query', input);
    console.log('match condition:', match);

    // Debug: Check total jobs in database
    const totalJobs = await this.jobModel.countDocuments({});
    console.log('Total jobs in database:', totalJobs);
    
    const result = await this.jobModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              {
                $addFields: {
                  memberId: { $toObjectId: '$memberId' },
                },
              },
              lookupAuhMemberLiked(memberId),
              lookupMember,
              {
                $unwind: {
                  path: '$memberData',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  private shapeMatchQuery(match: T, input: JobsInquiry): void {
    const {
      memberId,
      locationList,
      educationLevelList,
      typeList,
      employmentLevels,
      skillsRequired,
      isRemote,
      salaryRange,
      periodsRange,
      experienceRange,
      options,
      text,
    } = input.search;

    if (memberId) match.memberId = memberId; // Don't convert to ObjectId since memberId is stored as string
    if (locationList && locationList.length)
      match.jobLocation = { $in: locationList };
    if (educationLevelList && educationLevelList.length)
      match.educationLevel = { $in: educationLevelList };
    if (typeList && typeList.length) match.jobType = { $in: typeList };
    if (employmentLevels?.length)
      match.employmentLevel = { $in: employmentLevels };
    if (skillsRequired?.length) match.skillsRequired = { $all: skillsRequired };
    if (typeof isRemote === 'boolean') match.isRemote = isRemote;
    if (salaryRange)
      match.jobSalary = { $gte: salaryRange.start, $lte: salaryRange.end };
    if (periodsRange)
      match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
    if (experienceRange)
      match.experienceYears = {
        $gte: experienceRange.start,
        $lte: experienceRange.end,
      };

    if (text) match.positionTitle = { $regex: new RegExp(text, 'i') };
    if (options) {
      match['$or'] = options.map((ele) => {
        return { [ele]: true };
      });
    }
  }

  public async getFavorites(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Jobs> {
    return await this.likeService.getFavoriteJobs(memberId, input);
  }

  public async getVisited(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Jobs> {
    return await this.viewService.getVisitedJobs(memberId, input);
  }

  public async getAgentJobs(
    memberId: ObjectId,
    input: AgentJobsInquiry,
  ): Promise<Jobs> {
    const { jobStatus } = input.search;
    if (jobStatus === JobStatus.DELETE)
      throw new BadRequestException(Message.REQUEST_NOT_ALLOWED);

    const match: T = {
      memberId: memberId.toString(), // Convert ObjectId to string since memberId is stored as string
      jobStatus: jobStatus ?? { $ne: JobStatus.DELETE },
    };
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };

    const result = await this.jobModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              {
                $addFields: {
                  memberId: { $toObjectId: '$memberId' },
                },
              },
              lookupMember,
              {
                $unwind: {
                  path: '$memberData',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  public async likeTargetJob(
    memberId: ObjectId,
    likeRefId: ObjectId,
  ): Promise<Job> {
    const target: Job = await this.jobModel
      .findOne({ _id: likeRefId, jobStatus: JobStatus.OPEN })
      .exec();
    if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId: memberId,
      likeRefId: likeRefId,
      likeGroup: LikeGroup.JOB,
    };

    const modifier: number = await this.likeService.toggleLike(input);
    const result = await this.jobStatsEditor({
      _id: likeRefId,
      targetKey: 'jobLikes',
      modifier: modifier,
    });
    if (!result)
      throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

    return result;
  }

  public async getSimilarJobs(
    memberId: ObjectId,
    jobId: ObjectId,
    limit: number = 6,
  ): Promise<Jobs> {
    // Get the target job to find similar ones
    const targetJob: Job = await this.jobModel
      .findOne({ _id: jobId, jobStatus: JobStatus.OPEN })
      .exec();
    
    if (!targetJob) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    // Simple similarity match using $or to find jobs with similar characteristics
    const similarJobs = await this.jobModel
      .aggregate([
        {
          $match: {
            _id: { $ne: jobId }, 
            jobStatus: JobStatus.OPEN,
            $or: [
            
              {
                jobType: targetJob.jobType,
                jobLocation: targetJob.jobLocation,
              },
            
              {
                jobType: targetJob.jobType,
              },
            
              {
                jobSalary: {
                  $gte: targetJob.jobSalary * 0.7,
                  $lte: targetJob.jobSalary * 1.3,
                },
              },
             
              {
                educationLevel: targetJob.educationLevel,
              },
            ],
          },
        },
        // Add a score based on similarity
        {
          $addFields: {
            similarityScore: {
              $sum: [
                { $cond: [{ $eq: ['$jobType', targetJob.jobType] }, 3, 0] },
                { $cond: [{ $eq: ['$jobLocation', targetJob.jobLocation] }, 2, 0] },
                { $cond: [{ $eq: ['$educationLevel', targetJob.educationLevel] }, 1, 0] },
                { $cond: [{ $eq: ['$employmentLevel', targetJob.employmentLevel] }, 1, 0] },
              ],
            },
          },
        },
        // Sort by similarity score (descending) then by creation date
        {
          $sort: {
            similarityScore: -1,
            createdAt: -1,
          },
        },
        { $limit: limit },
        {
          $addFields: {
            memberId: { $toObjectId: '$memberId' },
          },
        },
        lookupAuhMemberLiked(memberId),
        lookupMember,
        {
          $unwind: {
            path: '$memberData',
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .exec();

    return {
      list: similarJobs,
      metaCounter: [{ total: similarJobs.length }],
    };
  }

  /**Admin */
  public async getAllJobsByAdmin(input: AllJobsInquiry): Promise<Jobs> {
    const { jobStatus, jobLocationList } = input.search;

    const match: T = {};
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };

    if (jobStatus) match.jobStatus = jobStatus;
    if (jobLocationList) match.jobLocation = { $in: jobLocationList };

    const result = await this.jobModel
      .aggregate([
        {
          $addFields: {
            memberId: { $toObjectId: '$memberId' },
          },
        },
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  public async updateJobByAdmin(input: JobUpdate): Promise<Job> {
    let { jobStatus, closedAt, deletedAt, _id } = input;

    if (![JobStatus.CLOSED, JobStatus.DELETE].includes(jobStatus))
      throw new BadRequestException('Invalid status update');

    const search: T = {
      _id: _id,
      jobStatus: JobStatus.OPEN,
    };

    if (jobStatus === JobStatus.CLOSED) input.closedAt = moment().toDate();
    else if (jobStatus === JobStatus.DELETE)
      input.deletedAt = moment().toDate();

    const result = await this.jobModel
      .findOneAndUpdate(search, input, { new: true })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (closedAt || deletedAt) {
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: 'memberPostedJobs',
        modifier: -1,
      });
    }
    return result;
  }

  public async removeJobByAdmin(jobId: ObjectId): Promise<Job> {
    const search: T = {
      _id: jobId,
      jobStatus: JobStatus.CLOSED,
    };

    const result = await this.jobModel.findOneAndDelete(search).exec();
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

    return result;
  }

  public async jobStatsEditor(input: StatisticModifier): Promise<Job> {
    const { _id, targetKey, modifier } = input;
    return await this.jobModel
      .findByIdAndUpdate(
        _id,
        { $inc: { [targetKey]: modifier } },
        { new: true },
      )
      .exec();
  }

  public async addApplicationToJob(jobId: ObjectId, applicationId: string): Promise<Job> {
    return await this.jobModel
      .findByIdAndUpdate(
        jobId,
        {
          $inc: { applicationCount: 1 },
          $push: { applications: applicationId },
        },
        { new: true },
      )
      .exec();
  }

  public async removeApplicationFromJob(jobId: ObjectId, applicationId: string): Promise<Job> {
    return await this.jobModel
      .findByIdAndUpdate(
        jobId,
        {
          $inc: { applicationCount: -1 },
          $pull: { applications: applicationId },
        },
        { new: true },
      )
      .exec();
  }
}
