import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ReqContext } from '@/@decorators/request-context.decorator';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';

import { TGetBackofficeConfigsService } from '../services/get-backoffice-configs.service';
import { AdminToken } from '@/@decorators/admin-token.decorator';

@Controller('backoffice/configs')
export class GetBackofficeConfigsController {
  constructor(private getService: TGetBackofficeConfigsService) {}

  @AdminToken()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getConfigs(@ReqContext() context: IRequestContext) {
    const result = await this.getService.execute(undefined, context);

    if (result.error) {
      if (result.error instanceof AbstractApplicationException) {
        result.error.context = context;
      }

      throw result.error;
    }

    return result.getValue();
  }
}
