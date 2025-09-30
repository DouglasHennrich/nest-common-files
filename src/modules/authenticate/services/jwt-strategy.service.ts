import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TEnvService } from '@/modules/env/services/env.service';
import { AccountUserTypeEnum } from '@/modules/accounts/models/account.struct';

const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  userType: z.nativeEnum(AccountUserTypeEnum).optional(),
});

export type TAccountPayload = z.infer<typeof tokenPayloadSchema>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(envService: TEnvService) {
    const publicKey = envService.get('AUTH_JWT_PUBLIC_KEY');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    });
  }

  validate(payload: TAccountPayload) {
    return tokenPayloadSchema.parse(payload);
  }
}
