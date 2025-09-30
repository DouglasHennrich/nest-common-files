import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './services/jwt-strategy.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthenticateGuard } from './guard/jwt-authenticate.guard';
import { EnvModule } from '../env/env.module';
import { EnvService, TEnvService } from '../env/services/env.service';
import { LoginService, TLoginService } from './services/login.service';
import { CryptographyModule } from '@/@shared/cryptography/cryptography.module';
import { AccountsModule } from '../accounts/accounts.module';
import { LoginController } from './controllers/login.controller';
import {
  GetCurrentUserService,
  TGetCurrentUserService,
} from './services/get-current-user.service';
import { ProfessionalsModule } from '../professionals/professionals.module';
import { ResponsablesModule } from '../responsables/responsables.module';
import { SignUpController } from './controllers/sign-up.controller';
import { TSignUpService, SignUpService } from './services/sign-up.service';
import { AdminTokenGuard } from './guard/admin-token.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      imports: [EnvModule],
      inject: [TEnvService],
      useFactory: (envService: TEnvService) => ({
        privateKey: Buffer.from(
          envService.get('AUTH_JWT_PRIVATE_KEY'),
          'base64',
        ),
        publicKey: Buffer.from(envService.get('AUTH_JWT_PUBLIC_KEY'), 'base64'),
        signOptions: {
          algorithm: 'RS256',
          expiresIn: '1d',
        },
      }),
    }),
    CryptographyModule,
    AccountsModule,
    ProfessionalsModule,
    ResponsablesModule,
  ],
  providers: [
    JwtStrategy,
    {
      provide: TEnvService,
      useClass: EnvService,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthenticateGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AdminTokenGuard,
    },

    /// //////////////////////////
    //  Services
    /// //////////////////////////
    {
      provide: TLoginService,
      useClass: LoginService,
    },
    {
      provide: TSignUpService,
      useClass: SignUpService,
    },
    {
      provide: TGetCurrentUserService,
      useClass: GetCurrentUserService,
    },
  ],
  controllers: [LoginController, SignUpController],
  exports: [TGetCurrentUserService, TEnvService],
})
export class AuthenticateModule {}
