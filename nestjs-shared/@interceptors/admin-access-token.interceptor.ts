import {
  CallHandler,
  ConsoleLogger,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { TEnvService } from '../protocols/env-service.interface';

@Injectable()
export class AdminAccessTokenInterceptor implements NestInterceptor {
  private readonly logger: ConsoleLogger = new ConsoleLogger(
    AdminAccessTokenInterceptor.name,
  );

  constructor(private envService: TEnvService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = ctx.switchToHttp().getRequest();
    const token = req.headers['x-custom-token'];

    if (token !== this.envService.get('SECRET_ADMIN_ACCESS_TOKEN')) {
      this.logger.warn('Invalid admin access token');

      throw new UnauthorizedException();
    }

    return next.handle();
  }
}
