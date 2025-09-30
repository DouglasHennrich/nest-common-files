import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from '../casl-ability.factory';
import { Request } from 'express';
import { CHECK_POLICIES_KEY } from '../decorators/check-policies.decorator';
import { TPolicyHandler } from '../models/polict.struct';
import { TCurrentUser } from '@/modules/authenticate/guard/jwt-authenticate.guard';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const policyHandlers = this.reflector.getAllAndOverride<TPolicyHandler[]>(
      CHECK_POLICIES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!policyHandlers) return true;

    const request: Request = context.switchToHttp().getRequest();
    const currentUser = request.currentUser as TCurrentUser;

    if (!currentUser) {
      throw new ForbiddenException();
    }

    const ability = this.caslAbilityFactory.defineAbility(currentUser);

    const isAllowed = policyHandlers.every((handler) =>
      typeof handler === 'function'
        ? handler(ability)
        : handler.handle(ability),
    );

    if (!isAllowed) throw new ForbiddenException();

    return true;
  }
}
