import { Injectable } from '@nestjs/common';

import { Result } from '@/@shared/classes/result';
import { AbstractService } from '@/@shared/classes/service';
import { TAccountPayload } from './jwt-strategy.service';
import { TCurrentUser } from '../guard/jwt-authenticate.guard';
import { IProfessionalsRepository } from '@/modules/professionals/repositories/professionals.repository';
import { IResponsablesRepository } from '@/modules/responsables/repositories/responsables.repository';
import { AccountUserTypeEnum } from '@/modules/accounts/models/account.struct';
import { ProfessionalNotFoundException } from '@/modules/professionals/errors/professional-not-found.exception';
import { ResponsableNotFoundException } from '@/modules/responsables/errors/responsable-not-found.exception';
import { ILogger } from '@/@shared/classes/custom-logger';

export abstract class TGetCurrentUserService extends AbstractService<
  TAccountPayload,
  TCurrentUser
> {}

@Injectable()
export class GetCurrentUserService implements TGetCurrentUserService {
  constructor(
    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    private professionalsRepository: IProfessionalsRepository,
    private responsablesRepository: IResponsablesRepository,

    /// //////////////////////////
    //  Providers
    /// //////////////////////////
    public logger: ILogger,
  ) {
    this.logger.setContextName(GetCurrentUserService.name);
  }

  async execute({
    sub,
    userType,
  }: TAccountPayload): Promise<Result<TCurrentUser>> {
    // this.logger.warn(`Getting current user: ${sub}. usertType: ${userType}`);

    if (userType === AccountUserTypeEnum.RESPONSABLE) {
      return await this.getResponsable(sub);
    }

    return await this.getProfessional(sub);
  }

  async getResponsable(sub: string): Promise<Result<TCurrentUser>> {
    const responsable = await this.responsablesRepository.findById(sub);

    if (!responsable) {
      return Result.fail(new ResponsableNotFoundException(undefined, sub));
    }

    return Result.success({
      ...responsable,
      userType: AccountUserTypeEnum.RESPONSABLE,
    });
  }

  async getProfessional(sub: string): Promise<Result<TCurrentUser>> {
    const professional = await this.professionalsRepository.findById(sub);

    if (!professional) {
      return Result.fail(new ProfessionalNotFoundException(undefined, sub));
    }

    return Result.success({
      ...professional,
      userType: professional.professionalType as unknown as AccountUserTypeEnum,
    });
  }
}
