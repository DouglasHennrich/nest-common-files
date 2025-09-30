import { Injectable } from '@nestjs/common';
import { Result } from '@/@shared/classes/result';
import { AbstractService } from '@/@shared/classes/service';
import { signUpDtoBodySchema, TSignUpDtoBodySchema } from '../dto/sign-up.dto';
import { TCurrentUser } from '../guard/jwt-authenticate.guard';
import { TCreateProfessionalService } from '@/modules/professionals/services/create-professional.service';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { ILogger } from '@/@shared/classes/custom-logger';
import { TLoginService } from './login.service';

export interface ISignUpServiceResponse {
  accessToken: string;
  refreshToken: string;
  user: TCurrentUser;
}

export abstract class TSignUpService extends AbstractService<
  TSignUpDtoBodySchema,
  ISignUpServiceResponse
> {}

@Injectable()
export class SignUpService implements TSignUpService {
  constructor(
    /// //////////////////////////
    //  Services
    /// //////////////////////////
    private createProfessionalService: TCreateProfessionalService,
    private loginService: TLoginService,

    /// //////////////////////////
    //  Providers
    /// //////////////////////////
    public logger: ILogger,
  ) {
    this.logger.setContextName(SignUpService.name);
  }

  async execute(
    serviceDto: TSignUpDtoBodySchema,
    context?: IRequestContext,
  ): Promise<Result<ISignUpServiceResponse>> {
    const validateDtoResult = this.validateDto(serviceDto);

    if (validateDtoResult.error) {
      return Result.fail(validateDtoResult.error);
    }

    const { area, ...request } = validateDtoResult.getValue()!;

    const createNewAccountResult = await this.createProfessionalService.execute(
      {
        ...request,
        professionalType: area,
      },
      context,
    );

    if (createNewAccountResult.error) {
      return Result.fail(createNewAccountResult.error);
    }

    const loginResult = await this.loginService.execute(
      {
        email: serviceDto.email,
        password: serviceDto.password,
      },
      context,
    );

    if (loginResult.error) {
      return Result.fail(loginResult.error);
    }

    return Result.success(loginResult.getValue()!);
  }

  validateDto(serviceDto: TSignUpDtoBodySchema): Result<TSignUpDtoBodySchema> {
    try {
      const validatedDto = signUpDtoBodySchema.parse(serviceDto);

      return Result.success(validatedDto);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
