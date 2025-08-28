import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { ApplicationService } from './application.service';
import { Application, Applications, ApplicationStats } from '../../libs/dto/application/application';
import { ApplicationInput, ApplicationUpdate, ApplicationsInquiry } from '../../libs/dto/application/application.input';
import { shapeIntoMongooseObjectId } from '../../libs/config';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { mkdirSync, existsSync } from 'fs';
import { getSerialForFile, validMimeTypes } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';

@Resolver()
export class ApplicationResolver {
  constructor(private readonly applicationService: ApplicationService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Application)
  public async createApplication(
    @Args('input') input: ApplicationInput,
    @AuthMember('_id') applicantId: ObjectId,
  ): Promise<Application> {
    console.log('Mutation: createApplication');
    return await this.applicationService.createApplication(applicantId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Application)
  public async getApplication(
    @Args('applicationId') applicationId: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Application> {
    console.log('Query: getApplication');
    const appId = shapeIntoMongooseObjectId(applicationId);
    return await this.applicationService.getApplication(memberId, appId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Application)
  public async updateApplication(
    @Args('input') input: ApplicationUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Application> {
    console.log('Mutation: updateApplication');
    return await this.applicationService.updateApplication(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Applications)
  public async getApplications(
    @Args('input') input: ApplicationsInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Applications> {
    console.log('Query: getApplications');
    return await this.applicationService.getApplications(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Applications)
  public async getMyApplications(
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Applications> {
    console.log('Query: getMyApplications');
    const input: ApplicationsInquiry = {
      page: 1,
      limit: 50,
      search: {
        applicantId: memberId.toString(),
      },
    };
    return await this.applicationService.getApplications(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Applications)
  public async getJobApplications(
    @Args('input') input: ApplicationsInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Applications> {
    console.log('Query: getJobApplications');
    // Set the companyId to the current user's ID to get applications for their posted jobs
    input.search = {
      ...input.search,
      companyId: memberId.toString(),
    };
    return await this.applicationService.getApplications(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Applications)
  public async getMyJobApplications(
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Applications> {
    console.log('Query: getMyJobApplications');
    const input: ApplicationsInquiry = {
      page: 1,
      limit: 50,
      search: {
        companyId: memberId.toString(),
      },
    };
    return await this.applicationService.getApplications(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Application)
  public async withdrawApplication(
    @Args('applicationId') applicationId: string,
    @AuthMember('_id') applicantId: ObjectId,
  ): Promise<Application> {
    console.log('Mutation: withdrawApplication');
    const appId = shapeIntoMongooseObjectId(applicationId);
    return await this.applicationService.withdrawApplication(applicantId, appId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Application)
  public async markApplicationAsViewed(
    @Args('applicationId') applicationId: string,
    @AuthMember('_id') companyId: ObjectId,
  ): Promise<Application> {
    console.log('Mutation: markApplicationAsViewed');
    const appId = shapeIntoMongooseObjectId(applicationId);
    return await this.applicationService.markAsViewed(companyId, appId);
  }

  @UseGuards(AuthGuard)
  @Query(() => ApplicationStats)
  public async getApplicationStats(
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<ApplicationStats> {
    console.log('Query: getApplicationStats');
    return await this.applicationService.getApplicationStats(memberId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Application)
  public async deleteApplication(
    @Args('applicationId') applicationId: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Application> {
    console.log('Mutation: deleteApplication');
    const appId = shapeIntoMongooseObjectId(applicationId);
    return await this.applicationService.deleteApplication(memberId, appId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => String)
  public async uploadResume(
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<string> {
    console.log('Mutation: uploadResume');
    
    // Validate file type
    const validMime = validMimeTypes.includes(mimetype);
    if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FILE_TYPE);
    
    // Create upload directory
    const uploadDir = 'uploads/resumes';
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    
    // Generate unique filename
    const resumeName = getSerialForFile(filename); 
    const url = `${uploadDir}/${resumeName}`;
    
    // Save file
    const stream = createReadStream();
    const writeStream = createWriteStream(url);
    
    return new Promise((resolve, reject) => {
      stream
        .pipe(writeStream)
        .on('finish', () => resolve(url))
        .on('error', (error) => reject(error));
    });
  }
}
