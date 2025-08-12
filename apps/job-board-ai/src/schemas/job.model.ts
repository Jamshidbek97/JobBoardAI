import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  JobType,
  JobStatus,
  JobLocation,
  EducationLevel,
  EmploymentLevel,
} from '../libs/enums/job.enum';

@Schema({ timestamps: true })
export class Job extends Document {
  @Prop({ type: String, enum: JobType, required: true })
  jobType: JobType;

  @Prop({ type: String, enum: JobStatus, default: JobStatus.OPEN })
  jobStatus: JobStatus;

  @Prop({ type: String, enum: JobLocation, required: true })
  jobLocation: JobLocation;

  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  positionTitle: string;

  @Prop({ type: Number, required: true })
  jobSalary: number;

  @Prop({ type: Number, required: true })
  experienceYears: number;

  @Prop({ type: String, enum: EducationLevel, required: true })
  educationLevel: EducationLevel;

  @Prop({ type: String, enum: EmploymentLevel, required: true })
  employmentLevel: EmploymentLevel;

  @Prop({ type: String })
  jobDesc?: string;

  @Prop({ type: [String] })
  skillsRequired?: string[];

  @Prop({ type: String })
  companyLogo?: string;

  @Prop({ default: 0 })
  jobViews: number;

  @Prop({ default: 0 })
  jobLikes: number;

  @Prop({ default: 0 })
  jobComments: number;

  @Prop({ default: 0 })
  jobRank: number;

  @Prop({ type: String, required: true })
  memberId: string;

  @Prop({ type: Date })
  closedAt?: Date;

  @Prop({ type: Date })
  archivedAt?: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
