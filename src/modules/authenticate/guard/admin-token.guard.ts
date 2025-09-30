import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TEnvService } from '@/modules/env/services/env.service';
import { DefaultException } from '@/@shared/errors/abstract-application-exception';
import { ILogger } from '@/@shared/classes/custom-logger';

export const ADMIN_TOKEN_KEY = 'adminToken';

@Injectable()
export class AdminTokenGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private envService: TEnvService,
    public logger: ILogger,
  ) {
    this.logger.setContextName(AdminTokenGuard.name);
  }

  canActivate(context: ExecutionContext): boolean {
    const isAdminTokenRequired = this.reflector.getAllAndOverride<boolean>(
      ADMIN_TOKEN_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se não for requerido token de admin, permite acesso
    if (!isAdminTokenRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-custom-token'];
    const adminToken = this.envService.get('SECRET_ADMIN_ACCESS_TOKEN');

    if (!token || token !== adminToken) {
      this.logger.warn('Invalid admin token provided');

      throw new DefaultException(
        'Invalid token provided',
        'AdminTokenGuardException',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
