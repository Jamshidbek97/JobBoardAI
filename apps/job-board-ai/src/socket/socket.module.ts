import { Module } from '@nestjs/common';
import { AuthModule } from '../components/auth/auth.module';
import { SocketGateway } from './socket.gateway';

@Module({
  imports: [AuthModule],
  providers: [SocketGateway],
})
export class SocketModule {}
