import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { GenerateRandom } from '@/@shared/utils/generateRandom';

export const ReqContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IRequestContext => {
    const request: Request = ctx.switchToHttp().getRequest();

    return {
      logId: GenerateRandom.id(),
      timestamp: new Date(),
      ip: request?.ip,
      userAgent: request?.headers['user-agent'],
      authentication: request?.authentication,
      user: request?.currentUser,
    };
  },
);
