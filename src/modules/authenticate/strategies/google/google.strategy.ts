import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TEnvService } from '@/modules/env/services/env.service';
import { ILogger } from '@/@shared/classes/custom-logger';
import { AccountProviderTypeEnum } from '@/modules/accounts/enums/account.enum';
import z from 'zod';

const tokenPayloadSchema = z.object({
  provider: z.nativeEnum(AccountProviderTypeEnum),
  providerId: z.string(),
  email: z.string().email(),
  name: z.string().min(1).optional(),
  avatar: z.string().url().optional(),
});

export type TOAuthAccountPayload = z.infer<typeof tokenPayloadSchema>;

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    envService: TEnvService,
    public logger: ILogger,
  ) {
    const googleClientId = envService.get('AUTH_GOOGLE_CLIENT_ID');
    const googleClientSecret = envService.get('AUTH_GOOGLE_CLIENT_SECRET');
    const callbackURL = `${envService.get('INFRA_URL')}:${envService.get('INFRA_PORT')}/api/${envService.get('INFRA_API_VERSION')}/auth/sign-in/oauth/google/callback`;

    super({
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });

    this.logger.setContextName(GoogleStrategy.name);
  }

  validate(accessToken: string, refreshToken: string, profile: any) {
    try {
      const { name, emails, photos, id } = profile;

      this.logger.debug(
        `Validating Google OAuth2 profile: ${JSON.stringify(profile)}`,
      );

      const parsedProfile = {
        provider: AccountProviderTypeEnum.GOOGLE,
        providerId: id,
        name: name.givenName,
        email: emails[0].value,
        avatar: photos[0].value,
      };

      const parsedPayload = tokenPayloadSchema.parse(parsedProfile);

      return parsedPayload;
    } catch {
      throw new UnauthorizedException('Google authentication failed');
    }
  }
}
