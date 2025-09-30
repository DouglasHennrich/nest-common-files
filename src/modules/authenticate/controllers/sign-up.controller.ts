import { Body, Controller, Post } from '@nestjs/common';

import { ZodValidationPipe } from '@/@shared/pipes/zod-validation.pipe';
import { Public } from '@/modules/authenticate/public';
import { signUpDtoBodySchema, TSignUpDtoBodySchema } from '../dto/sign-up.dto';
import { TSignUpService } from '../services/sign-up.service';
import { CurrentAuthentication } from '@/@decorators/authentication.decorator';
import { TAccountPayload } from '../services/jwt-strategy.service';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { ReqContext } from '@/@decorators/request-context.decorator';

@Controller('auth/sign-up')
@Public()
export class SignUpController {
  constructor(private signUpService: TSignUpService) {}

  @Post()
  async signUp(
    @Body(new ZodValidationPipe(signUpDtoBodySchema))
    signUpDto: TSignUpDtoBodySchema,
    @CurrentAuthentication() auth?: TAccountPayload,
    @ReqContext() context?: IRequestContext,
  ) {
    const result = await this.signUpService.execute(signUpDto, context);

    if (result.error) {
      throw result.error;
    }

    return result.getValue();
  }
}
