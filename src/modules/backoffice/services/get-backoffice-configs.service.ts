import { Injectable } from '@nestjs/common';
import { Result } from '@/@shared/classes/result';
import { AbstractService } from '@/@shared/classes/service';
import { ILogger } from '@/@shared/classes/custom-logger';
import { IBackofficeConfigsModel } from '../models/backoffice-configs.struct';
import { BackofficeConfigsSingleton } from '../singletons/backoffice-configs.singleton';

export abstract class TGetBackofficeConfigsService extends AbstractService<
  void,
  IBackofficeConfigsModel
> {}

@Injectable()
export class GetBackofficeConfigsService
  implements TGetBackofficeConfigsService
{
  constructor(public logger: ILogger) {
    this.logger.setContextName(GetBackofficeConfigsService.name);
  }

  /* eslint-disable-next-line @typescript-eslint/require-await */
  async execute(_: void): Promise<Result<IBackofficeConfigsModel>> {
    return Result.success(BackofficeConfigsSingleton.shared!);
  }
}
