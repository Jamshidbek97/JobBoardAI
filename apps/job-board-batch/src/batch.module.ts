import { Module } from '@nestjs/common';
import { NestarBatchController } from './batch.controller';
import { NestarBatchService } from './batch.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { JobSchema } from 'apps/job-board-ai/src/schemas/job.model';
import MemberSchema from 'apps/job-board-ai/src/schemas/Member.model';

@Module({
	imports: [
		ConfigModule.forRoot(),
		DatabaseModule,
		ScheduleModule.forRoot(),
		MongooseModule.forFeature([{ name: 'Job', schema: JobSchema }]),
		MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
	],
	controllers: [NestarBatchController],
	providers: [NestarBatchService],
})
export class NestarBatchModule {}
