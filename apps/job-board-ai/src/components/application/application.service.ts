import { Injectable, BadRequestException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Application, Applications } from '../../libs/dto/application/application';
import { ApplicationInput, ApplicationStats, ApplicationUpdate, ApplicationsInquiry } from '../../libs/dto/application/application.input';
import { ApplicationStatus } from '../../schemas/Application.model';
import { Direction, Message } from '../../libs/enums/common.enum';
import { lookupMember, lookupJob, lookupApplicant, lookupCompany, shapeIntoMongooseObjectId } from '../../libs/config';
import { JobService } from '../job/job.service';
import { MemberService } from '../member/member.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, NotificationGroup } from '../../libs/enums/notification.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel('Application') private readonly applicationModel: Model<Application>,
    private readonly jobService: JobService,
    private readonly memberService: MemberService,
    private readonly notificationService: NotificationService,
  ) {}

  public async createApplication(
    applicantId: ObjectId,
    input: ApplicationInput,
  ): Promise<Application> {
    try {
      // Check if job exists and is open
      const job = await this.jobService.getJob(null, shapeIntoMongooseObjectId(input.jobId));
      if (!job) {
        throw new BadRequestException('Job not found or not available');
      }

      // Check if application deadline has passed
      if (job.applicationDeadline && new Date() > job.applicationDeadline) {
        throw new BadRequestException('Application deadline has passed');
      }

      // Check if max applications limit has been reached
      if (job.maxApplications && job.applicationCount >= job.maxApplications) {
        throw new BadRequestException('Maximum number of applications has been reached');
      }

      // Check if user already applied for this job
      const existingApplication = await this.applicationModel.findOne({
        jobId: input.jobId,
        applicantId: applicantId.toString(),
        isActive: true,
      });

      if (existingApplication) {
        throw new ConflictException('You have already applied for this job');
      }

      // Create application data
      const applicationData = {
        ...input,
        applicantId: applicantId.toString(),
        companyId: job.memberId.toString(),
        status: ApplicationStatus.PENDING,
        appliedAt: new Date(),
        isActive: true,
        isViewedByCompany: false,
        viewCount: 0,
      };

      const result = await this.applicationModel.create(applicationData);

      // Update job application count and add application ID to job
      await this.jobService.jobStatsEditor({
        _id: shapeIntoMongooseObjectId(input.jobId),
        targetKey: 'jobApplications',
        modifier: 1,
      });

      // Add application ID to job's applications array and update application count
      await this.jobService.addApplicationToJob(
        shapeIntoMongooseObjectId(input.jobId),
        result._id.toString()
      );

      // Create notification for job poster
      await this.createApplicationNotification(applicantId, job.memberId.toString(), job.positionTitle, 'APPLICATION');

      return result;
    } catch (err) {
      console.log('Error: ApplicationService.createApplication:', err.message);
      if (err instanceof ConflictException || err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException(Message.CREATE_FAILED);
    }
  }

  public async getApplication(
    memberId: ObjectId,
    applicationId: ObjectId,
  ): Promise<Application> {
    const application = await this.applicationModel
      .aggregate([
        {
          $match: {
            _id: applicationId,
            isActive: true,
            $or: [
              { applicantId: memberId.toString() },
              { companyId: memberId.toString() },
            ],
          },
        },
        {
          $addFields: {
            jobId: { $toObjectId: '$jobId' },
            applicantId: { $toObjectId: '$applicantId' },
            companyId: { $toObjectId: '$companyId' },
          },
        },
        lookupJob,
        {
          $unwind: {
            path: '$jobData',
            preserveNullAndEmptyArrays: true,
          },
        },
        lookupApplicant,
        {
          $unwind: {
            path: '$applicantData',
            preserveNullAndEmptyArrays: true,
          },
        },
        lookupCompany,
        {
          $unwind: {
            path: '$companyData',
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .exec();

    if (!application || application.length === 0) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }

    return application[0];
  }

  public async updateApplication(
    memberId: ObjectId,
    input: ApplicationUpdate,
  ): Promise<Application> {
    const { _id, ...updateData } = input;
    const applicationId = shapeIntoMongooseObjectId(_id);

    
    const existingApplication = await this.applicationModel.findOne({
      _id: applicationId,
      isActive: true,
    });

    if (!existingApplication) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }

    // Only company can update status, notes, feedback, interview date
    if (existingApplication.companyId !== memberId.toString()) {
      delete updateData.status;
      delete updateData.notes;
      delete updateData.feedback;
      delete updateData.interviewDate;
      delete updateData.isViewedByCompany;
    }

    // Only applicant can update their own application details
    if (existingApplication.applicantId !== memberId.toString()) {
      delete updateData.expectedSalary;
      delete updateData.coverLetter;
      delete updateData.resumeUrl;
      delete updateData.additionalDocuments;
    }

    const result = await this.applicationModel
      .findByIdAndUpdate(applicationId, updateData, { new: true })
      .exec();

    if (!result) {
      throw new InternalServerErrorException(Message.UPDATE_FAILED);
    }

    // Create notification for status changes
    if (updateData.status && updateData.status !== existingApplication.status) {
      await this.createApplicationStatusNotification(
        existingApplication.applicantId,
        existingApplication.companyId,
        updateData.status,
        existingApplication.jobId
      );
    }

    return result;
  }

  public async getApplications(
    memberId: ObjectId,
    input: ApplicationsInquiry,
  ): Promise<Applications> {
    const { page, limit, search, sort = 'appliedAt', direction = Direction.DESC } = input;

    // Build match criteria
    const match: T = { isActive: true };

    if (search.jobId) match.jobId = search.jobId;
    if (search.applicantId) match.applicantId = search.applicantId;
    if (search.companyId) match.companyId = search.companyId;
    if (search.status) match.status = search.status;
    if (search.statusList) match.status = { $in: search.statusList };
    if (search.isViewedByCompany !== undefined) match.isViewedByCompany = search.isViewedByCompany;

    // Add user-specific filtering
    match.$or = [
      { applicantId: memberId.toString() },
      { companyId: memberId.toString() },
    ];

    const result = await this.applicationModel
      .aggregate([
        { $match: match },
        { $sort: { [sort]: direction } },
        {
          $facet: {
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              {
                $addFields: {
                  jobId: { $toObjectId: '$jobId' },
                  applicantId: { $toObjectId: '$applicantId' },
                  companyId: { $toObjectId: '$companyId' },
                },
              },
              lookupJob,
              {
                $unwind: {
                  path: '$jobData',
                  preserveNullAndEmptyArrays: true,
                },
              },
              lookupApplicant,
              {
                $unwind: {
                  path: '$applicantData',
                  preserveNullAndEmptyArrays: true,
                },
              },
              lookupCompany,
              {
                $unwind: {
                  path: '$companyData',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }

    return result[0];
  }

  public async withdrawApplication(
    applicantId: ObjectId,
    applicationId: ObjectId,
  ): Promise<Application> {
    const application = await this.applicationModel.findOne({
      _id: applicationId,
      applicantId: applicantId.toString(),
      isActive: true,
    });

    if (!application) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Can only withdraw pending applications');
    }

    const result = await this.applicationModel
      .findByIdAndUpdate(
        applicationId,
        { 
          status: ApplicationStatus.WITHDRAWN,
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();

    if (!result) {
      throw new InternalServerErrorException(Message.UPDATE_FAILED);
    }

    // Remove application from job's applications array and decrease count
    await this.jobService.removeApplicationFromJob(
      shapeIntoMongooseObjectId(application.jobId),
      applicationId.toString()
    );

    return result;
  }

  public async markAsViewed(
    companyId: ObjectId,
    applicationId: ObjectId,
  ): Promise<Application> {
    const application = await this.applicationModel.findOne({
      _id: applicationId,
      companyId: companyId.toString(),
      isActive: true,
    });

    if (!application) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }

    const result = await this.applicationModel
      .findByIdAndUpdate(
        applicationId,
        {
          isViewedByCompany: true,
          viewedAt: new Date(),
          $inc: { viewCount: 1 },
        },
        { new: true }
      )
      .exec();

    if (!result) {
      throw new InternalServerErrorException(Message.UPDATE_FAILED);
    }

    return result;
  }

  public async getApplicationStats(memberId: ObjectId): Promise<ApplicationStats> {
    const stats = await this.applicationModel.aggregate([
      {
        $match: {
          isActive: true,
          $or: [
            { applicantId: memberId.toString() },
            { companyId: memberId.toString() },
          ],
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', ApplicationStatus.PENDING] }, 1, 0] },
          },
          reviewing: {
            $sum: { $cond: [{ $eq: ['$status', ApplicationStatus.REVIEWING] }, 1, 0] },
          },
          accepted: {
            $sum: { $cond: [{ $eq: ['$status', ApplicationStatus.ACCEPTED] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', ApplicationStatus.REJECTED] }, 1, 0] },
          },
          withdrawn: {
            $sum: { $cond: [{ $eq: ['$status', ApplicationStatus.WITHDRAWN] }, 1, 0] },
          },
        },
      },
    ]);

    if (!stats.length) {
      return {
        total: 0,
        pending: 0,
        reviewing: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0,
      };
    }

    return stats[0];
  }

  public async deleteApplication(
    memberId: ObjectId,
    applicationId: ObjectId,
  ): Promise<Application> {
    const application = await this.applicationModel.findOne({
      _id: applicationId,
      isActive: true,
      $or: [
        { applicantId: memberId.toString() },
        { companyId: memberId.toString() },
      ],
    });

    if (!application) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }

    const result = await this.applicationModel
      .findByIdAndUpdate(
        applicationId,
        { isActive: false },
        { new: true }
      )
      .exec();

    if (!result) {
      throw new InternalServerErrorException(Message.DELETE_FAILED);
    }

    // Remove application from job's applications array and decrease count
    await this.jobService.removeApplicationFromJob(
      shapeIntoMongooseObjectId(application.jobId),
      applicationId.toString()
    );

    return result;
  }

  private async createApplicationNotification(
    applicantId: ObjectId,
    companyId: string,
    jobTitle: string,
    type: 'APPLICATION'
  ): Promise<void> {
    try {
      // Get applicant member data for notification
      const applicantMember = await this.memberService.getMember(null, applicantId);
      
      await this.notificationService.createNotification(
        applicantId, // authorId (who applied)
        {
          notificationType: NotificationType.APPLICATION,
          notificationGroup: NotificationGroup.APPLICATION,
          notificationTitle: `New application received for ${jobTitle}`,
          notificationDesc: `${applicantMember.memberNick} has applied for your job posting`,
          receiverId: companyId, // job poster
          jobId: companyId, // job ID
        }
      );
    } catch (error) {
      console.error('Failed to create application notification:', error);
    }
  }

  private async createApplicationStatusNotification(
    applicantId: string,
    companyId: string,
    status: ApplicationStatus,
    jobId: string
  ): Promise<void> {
    try {
      // Get company member data for notification
      const companyMember = await this.memberService.getMember(null, shapeIntoMongooseObjectId(companyId));
      
      let statusMessage = '';
      switch (status) {
        case ApplicationStatus.REVIEWING:
          statusMessage = 'Your application is under review';
          break;
        case ApplicationStatus.ACCEPTED:
          statusMessage = 'Congratulations! Your application has been accepted';
          break;
        case ApplicationStatus.REJECTED:
          statusMessage = 'Your application has been reviewed but not selected';
          break;
        case ApplicationStatus.WITHDRAWN:
          statusMessage = 'Your application has been withdrawn';
          break;
        default:
          statusMessage = 'Your application status has been updated';
      }

      await this.notificationService.createNotification(
        shapeIntoMongooseObjectId(companyId), // authorId (company)
        {
          notificationType: NotificationType.APPLICATION_STATUS,
          notificationGroup: NotificationGroup.APPLICATION,
          notificationTitle: `Application Status Update`,
          notificationDesc: statusMessage,
          receiverId: applicantId, // applicant
          jobId: jobId,
        }
      );
    } catch (error) {
      console.error('Failed to create application status notification:', error);
    }
  }
}
