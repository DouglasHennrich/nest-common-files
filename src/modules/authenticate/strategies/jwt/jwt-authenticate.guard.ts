import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { CUSTOM_TOKEN_KEY } from '@/@decorators/custom-token.decorator';
import {
  IS_BYPASS_TERMS_KEY,
  IS_GOOGLE_KEY,
  IS_PASSKEY_KEY,
  IS_PUBLIC_KEY,
} from '../../metadatas-for-decorators';
import { ADMIN_TOKEN_KEY } from '../../guard/admin-token.guard';
import { TGetCurrentUserService } from '../../services/get-current-user.service';
import { TAccountPayload } from './jwt.strategy';
import { ILogger } from '@/@shared/classes/custom-logger';

@Injectable()
export class JwtAuthenticateGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private getCurrentUserService: TGetCurrentUserService,
    public logger: ILogger,
  ) {
    super();
    this.logger.setContextName(JwtAuthenticateGuard.name);
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
    const {
      isPublic,
      isAdminTokenRequired,
      isCustomTokenRequired,
      isGoogleAuth,
      isPasskeyAuth,
      isBypassTerms,
    } = this.getMetadata(context);

    if (
      isPublic ||
      isAdminTokenRequired ||
      isCustomTokenRequired ||
      isGoogleAuth ||
      isPasskeyAuth
    ) {
      return true;
    }

    const can = await super.canActivate(context);

    if (!can) return false;

    return await this.getCurrentUser(context, { isBypassTerms });
  }

  async getCurrentUser(
    context: ExecutionContext,
    opts: { isBypassTerms?: boolean },
  ) {
    const req: Request = context.switchToHttp().getRequest();
    const sub = (req.authentication as TAccountPayload)?.sub;

    if (sub) {
      const getCurrentUserResult = await this.getCurrentUserService.execute({
        sub,
        opts,
      });

      if (getCurrentUserResult.error) {
        throw getCurrentUserResult.error;
      }

      req.currentUser = getCurrentUserResult.getValue()!;
    }

    return true;
  }

  private getMetadata(context: ExecutionContext) {
    const isPublic =
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    const isAdminTokenRequired =
      this.reflector.getAllAndOverride<boolean>(ADMIN_TOKEN_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    const isCustomTokenRequired =
      this.reflector.getAllAndOverride<boolean>(CUSTOM_TOKEN_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    const isGoogleAuth =
      this.reflector.getAllAndOverride<boolean>(IS_GOOGLE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    const isPasskeyAuth =
      this.reflector.getAllAndOverride<boolean>(IS_PASSKEY_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    const isBypassTerms =
      this.reflector.getAllAndOverride<boolean>(IS_BYPASS_TERMS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    return {
      isPublic,
      isAdminTokenRequired,
      isCustomTokenRequired,
      isGoogleAuth,
      isPasskeyAuth,
      isBypassTerms,
    };
  }
}
