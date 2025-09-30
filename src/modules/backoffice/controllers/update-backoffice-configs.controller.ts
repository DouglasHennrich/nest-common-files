import { Body, Controller, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { ZodValidationPipe } from '@/@shared/pipes/zod-validation.pipe';
import { ReqContext } from '@/@decorators/request-context.decorator';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';
import {
  TUpdateBackofficeConfigsDtoBodySchema,
  updateBackofficeConfigsDtoBodySchema,
} from '../dto/update-backoffice-configs.dto';
import { TUpdateBackofficeConfigsService } from '../services/update-backoffice-configs.service';
import { AdminToken } from '@/@decorators/admin-token.decorator';

@Controller('backoffice/configs')
export class UpdateBackofficeConfigsController {
  constructor(private updateService: TUpdateBackofficeConfigsService) {}

  @AdminToken()
  @Put()
  @HttpCode(HttpStatus.OK)
  async handle(
    @ReqContext() context: IRequestContext,

    @Body(new ZodValidationPipe(updateBackofficeConfigsDtoBodySchema))
    body: TUpdateBackofficeConfigsDtoBodySchema,
  ) {
    const result = await this.updateService.execute(
      {
        ...body,
      },
      context,
    );

    if (result.error) {
      if (result.error instanceof AbstractApplicationException) {
        result.error.context = context;
      }

      throw result.error;
    }

    return result.getValue();
  }
}
