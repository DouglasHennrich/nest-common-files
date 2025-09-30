import { ILogger } from '@/@shared/classes/custom-logger';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { IS_GOOGLE_KEY } from '../../metadatas-for-decorators';
import { TAccountPayload } from '../jwt/jwt.strategy';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor(
    private reflector: Reflector,
    public logger: ILogger,
  ) {
    super();
    this.logger.setContextName(GoogleOAuthGuard.name);
  }

  handleRequest<TAccount = any>(
    err: any,
    user: TAccountPayload,
    _: any,
    context: ExecutionContext,
  ): TAccount {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    const req: Request = context.switchToHttp().getRequest();

    req.authentication = user;

    return user as TAccount;
  }

  async canActivate(context: ExecutionContext) {
    const { isGoogleAuth } = this.getMetadata(context);

    if (!isGoogleAuth) {
      return false;
    }

    const can = await super.canActivate(context);

    return can ? true : false;
  }

  private getMetadata(context: ExecutionContext) {
    const isGoogleAuth =
      this.reflector.getAllAndOverride<boolean>(IS_GOOGLE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    return {
      isGoogleAuth,
    };
  }
}
