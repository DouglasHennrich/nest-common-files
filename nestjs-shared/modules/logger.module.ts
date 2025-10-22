import { Global, Module, DynamicModule } from '@nestjs/common';
import { CustomLogger, ILogger } from '../classes/custom-logger';
import { TEnvService } from '../protocols/env-service.interface';

export interface LoggerModuleOptions {
  envServiceProvider?: any; // Provider for TEnvService
}

@Global()
@Module({})
export class LoggerModule {
  static forRoot(options: LoggerModuleOptions = {}): DynamicModule {
    const providers = [
      {
        provide: ILogger,
        useClass: CustomLogger,
      },
    ];

    if (options.envServiceProvider) {
      providers.push(options.envServiceProvider);
    }

    return {
      module: LoggerModule,
      providers,
      exports: [ILogger],
    };
  }
}
