import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PoliciesGuard } from './guards/policies.guard';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  providers: [
    CaslAbilityFactory,
    {
      provide: APP_GUARD,
      useClass: PoliciesGuard,
    },
  ],
  exports: [CaslAbilityFactory],
})
export class AuthorizationModule {}
