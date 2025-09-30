import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
// import { PasskeyService } from '@/modules/passkey/passkey.service';
import { ILogger } from '@/@shared/classes/custom-logger';

@Injectable()
export class PasskeyStrategy extends PassportStrategy(Strategy, 'passkey') {
  constructor(public logger: ILogger) {
    // private readonly passkeyService: PasskeyService
    super();
    this.logger.setContextName(PasskeyStrategy.name);
  }

  validate(req: Request) {
    // const { accountId, response } = (req as any).body;

    this.logger.debug(`Validating passkey ${JSON.stringify(req.body)}`);

    // const isValid = await this.passkeyService.verifyAuthenticationResponse(
    //   accountId,
    //   response,
    // );
    // if (!isValid) {
    //   throw new UnauthorizedException('Invalid passkey');
    // }

    // const account =
    //   await this.passkeyService.accountService.findById(accountId);

    // return account;
    return {
      ...req.body,
    };
  }
}
