import { TCurrentUser } from '@/modules/authenticate/guard/jwt-authenticate.guard';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TCurrentUser => {
    const request: Request = ctx.switchToHttp().getRequest();
    const currentUser = request.currentUser;

    if (!currentUser) {
      throw new Error('Current user not found in request');
    }

    return currentUser;
  },
);
