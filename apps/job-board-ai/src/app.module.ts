import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { DatabaseModule } from './database/database.module';
import { T } from './libs/types/common';
import { ComponentsModule } from './components/components.module';
// import { SocketModule } from './socket/socket.module';

// TODO: Need to develop socket module and component module

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      playground: true,
      uploads: false,
      autoSchemaFile: true,
      formatError: (error: T) => {
        const graphqlFormattedError = {
          code: error?.extensions?.code,
          message:
            error?.extension?.exception?.response?.message ||
            error?.extension?.response?.message ||
            error?.extensions?.originalError?.message ||
            error?.message,
        };
        console.log('GRAPHQL FORMATTED ERROR: ', graphqlFormattedError);
        return graphqlFormattedError;
      },
    }),
    ComponentsModule,
    DatabaseModule,
    // SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
