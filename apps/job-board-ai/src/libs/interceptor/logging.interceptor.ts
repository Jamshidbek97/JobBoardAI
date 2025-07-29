import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('GraphQL');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const type = context.getType<GqlContextType>();

    if (type === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const request = gqlContext.getContext().req.body;

      this.logger.log(`🟢 Request: ${this.stringify(request)}`, 'REQUEST');

      return next.handle().pipe(
        tap((res) => {
          this.logger.log(
            `✅ Response: ${this.stringify(res)} (${Date.now() - now}ms)`,
            'RESPONSE',
          );
        }),
        catchError((err) => {
          this.logger.error(`❌ Error: ${err.message}`, err.stack);
          throw err;
        }),
      );
    }

    // Handle HTTP or other types
    return next.handle();
  }

  private stringify(data: any): string {
    try {
      return JSON.stringify(data).slice(0, 300);
    } catch {
      return '[Unserializable]';
    }
  }
}
