import { Body, Controller, Post, UsePipes } from '@nestjs/common';

import { ZodValidationPipe } from '@/@shared/pipes/zod-validation.pipe';
import { TLoginService } from '../../authenticate/services/login.service';
import { Public } from '@/modules/authenticate/public';
import {
  loginDtoBodySchema,
  TLoginDtoBodySchema,
} from '@/modules/authenticate/dto/login.dto';

@Controller('auth/sign-in')
@Public()
export class LoginController {
  constructor(private loginService: TLoginService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(loginDtoBodySchema))
  async login(@Body() loginDto: TLoginDtoBodySchema) {
    const result = await this.loginService.execute(loginDto);

    if (result.error) {
      throw result.error;
    }

    return result.getValue();
  }
}
