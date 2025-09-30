import { Injectable } from '@nestjs/common';
import { Result } from '@/@shared/classes/result';
import { TLoginDtoBodySchema } from '../dto/login.dto';
import { AccountNotFoundException } from '../../accounts/errors/account-not-found.exception';
import { IAccountsRepository } from '../../accounts/repositories/accounts.repository';
import { AbstractService } from '@/@shared/classes/service';
import { THasher } from '@/@shared/cryptography/services/bcrypt-hasher.service';
import { TEncrypter } from '@/@shared/cryptography/services/jwt-encrypter.service';
import { ILogger } from '@/@shared/classes/custom-logger';
import { AccountUserTypeEnum } from '@/modules/accounts/models/account.struct';
import { ProfessionalNotFoundException } from '@/modules/professionals/errors/professional-not-found.exception';
import { ResponsableNotFoundException } from '@/modules/responsables/errors/responsable-not-found.exception';
import { TCurrentUser } from '../guard/jwt-authenticate.guard';

export interface ILoginServiceResponse {
  user: TCurrentUser;
  accessToken: string;
  refreshToken: string;
}

export abstract class TLoginService extends AbstractService<
  TLoginDtoBodySchema,
  ILoginServiceResponse
> {}

@Injectable()
export class LoginService implements TLoginService {
  constructor(
    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    private accountsRepository: IAccountsRepository,

    /// //////////////////////////
    //  Providers
    /// //////////////////////////
    private hashComparer: THasher,
    private jwtEncrypter: TEncrypter,
    public logger: ILogger,
  ) {
    this.logger.setContextName(LoginService.name);
  }

  async execute({
    email,
    password,
  }: TLoginDtoBodySchema): Promise<Result<ILoginServiceResponse>> {
    const account = await this.accountsRepository.findOne({
      where: { email },
      relations: {
        professional: true,
        responsable: true,
      },
    });

    if (!account) {
      const throwError = new AccountNotFoundException(email);

      return Result.fail(throwError);
    }

    const passwordIsValid = await this.hashComparer.compare(
      password,
      account.password,
    );

    if (!passwordIsValid) {
      const throwError = new AccountNotFoundException(email);

      return Result.fail(throwError);
    }

    let currentUser: TCurrentUser | undefined = undefined;

    if (account.userType === AccountUserTypeEnum.RESPONSABLE) {
      if (!account.responsable) {
        const throwError = new ResponsableNotFoundException(email);

        this.logger.error(
          `Account with email ${email} has userType as RESPONSABLE but no responsable linked.`,
        );

        return Result.fail(throwError);
      }

      currentUser = {
        ...account.responsable,
        userType: AccountUserTypeEnum.RESPONSABLE,
        isAdmin: account.isAdmin,
      };

      //
    } else {
      if (!account.professional) {
        const throwError = new ProfessionalNotFoundException(email);

        this.logger.error(
          `Account with email ${email} has userType as PROFESSIONAL but no professional linked.`,
        );

        return Result.fail(throwError);
      }

      currentUser = {
        ...account.professional,
        userType: account.professional
          .professionalType as unknown as AccountUserTypeEnum,
        isAdmin: account.isAdmin,
      };
    }

    const accessToken = await this.jwtEncrypter.accessToken({
      sub: currentUser.id,
      userType: currentUser.userType,
    });

    const refreshToken = await this.jwtEncrypter.refreshToken({
      sub: currentUser.id,
      userType: currentUser.userType,
    });

    return Result.success({
      user: currentUser,
      accessToken,
      refreshToken,
    });
  }
}
