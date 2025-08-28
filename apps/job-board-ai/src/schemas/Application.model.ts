import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  OFFER_SENT = 'OFFER_SENT',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
}

@Schema({ timestamps: true })
export class Application extends Document {
  @Prop({ type: String, required: true, ref: 'Job' })
  jobId: string;

  @Prop({ type: String, required: true, ref: 'Member' })
  applicantId: string;

  @Prop({ type: String, required: true, ref: 'Member' })
  companyId: string;

  @Prop({ 
    type: String, 
    enum: ApplicationStatus, 
    default: ApplicationStatus.PENDING 
  })
  status: ApplicationStatus;

  @Prop({ type: Date, default: Date.now })
  appliedAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: String, maxlength: 2000 })
  coverLetter?: string;

  @Prop({ type: String })
  resumeUrl?: string;

  @Prop({ type: [String] })
  additionalDocuments?: string[];

  @Prop({ type: String, maxlength: 1000 })
  notes?: string;

  @Prop({ type: Date })
  interviewDate?: Date;

  @Prop({ type: String, maxlength: 1000 })
  feedback?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  // Additional useful fields
  @Prop({ type: Number, required: true })
  expectedSalary: number;

  @Prop({ type: String, maxlength: 500 })
  availabilityDate?: string;

  @Prop({ type: Boolean, default: false })
  isRemotePreferred: boolean;

  @Prop({ type: String, maxlength: 500 })
  relevantExperience?: string;

  @Prop({ type: [String] })
  skills?: string[];

  @Prop({ type: String, maxlength: 200 })
  currentPosition?: string;

  @Prop({ type: String, maxlength: 200 })
  currentCompany?: string;

  @Prop({ type: Number })
  yearsOfExperience?: number;

  @Prop({ type: String, maxlength: 100 })
  preferredWorkSchedule?: string;

  @Prop({ type: Boolean, default: false })
  isRelocationWilling: boolean;

  @Prop({ type: String, maxlength: 200 })
  relocationLocation?: string;

  @Prop({ type: Date })
  earliestStartDate?: Date;

  @Prop({ type: String, maxlength: 500 })
  motivation?: string;

  @Prop({ type: [String] })
  references?: string[];

  @Prop({ type: String, maxlength: 100 })
  applicationSource?: string; // 'WEBSITE', 'LINKEDIN', 'INDEED', 'REFERRAL', etc.

  @Prop({ type: Boolean, default: false })
  isViewedByCompany: boolean;

  @Prop({ type: Date })
  viewedAt?: Date;

  @Prop({ type: Number, default: 0 })
  viewCount: number;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

// Indexes for better query performance
ApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
ApplicationSchema.index({ applicantId: 1, status: 1 });
ApplicationSchema.index({ companyId: 1, status: 1 });
ApplicationSchema.index({ status: 1, appliedAt: -1 });
ApplicationSchema.index({ isActive: 1 });

// Register enum with GraphQL
registerEnumType(ApplicationStatus, {
  name: 'ApplicationStatus',
  description: 'The status of a job application',
});
