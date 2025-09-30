import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ILogger } from '@/@shared/classes/custom-logger';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { IS_PASSKEY_KEY } from '../../metadatas-for-decorators';
import { TAccountPayload } from '../jwt/jwt.strategy';

@Injectable()
export class PasskeyGuard extends AuthGuard('passkey') {
  constructor(
    private reflector: Reflector,
    public logger: ILogger,
  ) {
    super();
    this.logger.setContextName(PasskeyGuard.name);
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
    const { isPasskeyAuth } = this.getMetadata(context);

    if (!isPasskeyAuth) {
      return false;
    }

    const can = await super.canActivate(context);

    return can ? true : false;
  }

  private getMetadata(context: ExecutionContext) {
    const isPasskeyAuth =
      this.reflector.getAllAndOverride<boolean>(IS_PASSKEY_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    return {
      isPasskeyAuth,
    };
  }
}
