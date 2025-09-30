import { Injectable } from '@nestjs/common';
import { Result } from '@/@shared/classes/result';
import { AbstractService } from '@/@shared/classes/service';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { ILogger } from '@/@shared/classes/custom-logger';
import {
  updateBackofficeConfigsDtoServiceSchema,
  TUpdateBackofficeConfigsDtoServiceSchema,
} from '../dto/update-backoffice-configs.dto';
import { IBackofficeConfigsModel } from '../models/backoffice-configs.struct';
import { BackofficeConfigsSingleton } from '../singletons/backoffice-configs.singleton';

export abstract class TUpdateBackofficeConfigsService extends AbstractService<
  TUpdateBackofficeConfigsDtoServiceSchema,
  IBackofficeConfigsModel
> {}

@Injectable()
export class UpdateBackofficeConfigsService
  implements TUpdateBackofficeConfigsService
{
  constructor(public logger: ILogger) {
    this.logger.setContextName(UpdateBackofficeConfigsService.name);
  }

  async execute(
    serviceDto: TUpdateBackofficeConfigsDtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<IBackofficeConfigsModel>> {
    const validateDtoResult = this.validateDto(serviceDto);

    if (validateDtoResult.error) {
      return Result.fail(validateDtoResult.error);
    }

    const validatedDto = validateDtoResult.getValue()!;

    this.logger.debug(
      `Updating backoffice configs: ${JSON.stringify(validatedDto)}`,
      context,
    );

    await BackofficeConfigsSingleton.updateConfigs(validatedDto);

    return Result.success(BackofficeConfigsSingleton.shared!);
  }

  validateDto(
    serviceDto: TUpdateBackofficeConfigsDtoServiceSchema,
  ): Result<TUpdateBackofficeConfigsDtoServiceSchema> {
    try {
      const validatedDto =
        updateBackofficeConfigsDtoServiceSchema.parse(serviceDto);

      return Result.success(validatedDto);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
