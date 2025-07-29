import { registerEnumType } from '@nestjs/graphql';

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
}

export enum JobLocation {
  SEOUL = 'SEOUL',
  BUSAN = 'BUSAN',
  DAEGU = 'DAEGU',
  REMOTE = 'REMOTE',
}

export enum JobStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING',
  DELETE = 'DELETE',
}

export enum SalaryRange {
  LOW = 'LOW',
  MID = 'MID',
  HIGH = 'HIGH',
}

registerEnumType(JobType, { name: 'JobType' });
registerEnumType(JobLocation, { name: 'JobLocation' });
registerEnumType(JobStatus, { name: 'JobStatus' });
registerEnumType(SalaryRange, { name: 'SalaryRange' });
