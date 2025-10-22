import { Global, Module, DynamicModule, Type } from '@nestjs/common';
import { CustomLogger, ILogger } from '../classes/custom-logger';
import { TEnvService } from '../protocols/env-service.interface';
import { CacheModule } from './cache/cache.module';

export interface CommonSharedsModuleOptions {
  envServiceProvider?: any; // Provider for TEnvService
  cacheEnabled?: boolean; // Whether to enable cache module
  loggerEnabled?: boolean; // Whether to enable logger
}

export interface CommonSharedsModuleAsyncOptions {
  inject?: any[]; // Modules/tokens to inject
  useFactory: (...args: any[]) => CommonSharedsModuleOptions; // Factory function
}

@Global()
@Module({})
export class CommonSharedsModule {
  static forRoot(options: CommonSharedsModuleOptions = {}): DynamicModule {
    const {
      envServiceProvider,
      cacheEnabled = false,
      loggerEnabled = true,
    } = options;

    const providers: any[] = [];
    const imports: any[] = [];
    const exports: any[] = [];

    // Add env service provider if provided
    if (envServiceProvider) {
      providers.push(envServiceProvider);
    }

    // Add logger if enabled
    if (loggerEnabled) {
      providers.push({
        provide: ILogger,
        useClass: CustomLogger,
      });
      exports.push(ILogger);
    }

    // Add cache if enabled
    if (cacheEnabled) {
      imports.push(CacheModule.forRoot({ envServiceProvider }));
    }

    return {
      module: CommonSharedsModule,
      imports,
      providers,
      exports,
      global: true,
    };
  }

  static forRootAsync(options: CommonSharedsModuleAsyncOptions): DynamicModule {
    return {
      module: CommonSharedsModule,
      imports: [],
      providers: [
        {
          provide: 'COMMON_SHAREDS_MODULE_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: CommonSharedsModule,
          useFactory: (moduleOptions: CommonSharedsModuleOptions) =>
            CommonSharedsModule.forRoot(moduleOptions),
          inject: ['COMMON_SHAREDS_MODULE_OPTIONS'],
        },
      ],
      exports: [CommonSharedsModule],
      global: true,
    };
  }
}