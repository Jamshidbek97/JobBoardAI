import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationResolver } from './application.resolver';
import { ApplicationService } from './application.service';
import { ApplicationSchema } from '../../schemas/Application.model';
import { JobModule } from '../job/job.module';
import { MemberModule } from '../member/member.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Application', schema: ApplicationSchema },
    ]),
    JobModule,
    MemberModule,
    AuthModule,
  ],
  providers: [ApplicationResolver, ApplicationService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
