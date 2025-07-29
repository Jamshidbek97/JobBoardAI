import { Module } from '@nestjs/common';
import { NestarBatchController } from './batch.controller';
import { NestarBatchService } from './batch.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import PropertySchema from 'apps/nestar-api/src/schemas/Property.model';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from 'apps/nestar-api/src/schemas/Member.model';

@Module({
	imports: [
		ConfigModule.forRoot(),
		DatabaseModule,
		ScheduleModule.forRoot(),
		MongooseModule.forFeature([{ name: 'Property', schema: PropertySchema }]),
		MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
	],
	controllers: [NestarBatchController],
	providers: [NestarBatchService],
})
export class NestarBatchModule {}
