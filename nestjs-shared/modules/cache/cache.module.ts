import { Module, Global, DynamicModule } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { TEnvService } from '../../protocols/env-service.interface';
import {
  ImageCacheService,
  TImageCacheService,
} from './services/image-cache.service';

export interface CacheModuleOptions {
  envServiceProvider?: any; // Provider for TEnvService
}

export interface CacheModuleAsyncOptions {
  inject?: any[]; // Modules/tokens to inject
  useFactory: (...args: any[]) => CacheModuleOptions; // Factory function
}

@Global()
@Module({})
export class CacheModule {
  static forRoot(options: CacheModuleOptions = {}): DynamicModule {
    const { envServiceProvider } = options;

    const providers: any[] = [
      {
        provide: TImageCacheService,
        useClass: ImageCacheService,
      },
    ];

    const imports: any[] = [];

    // Add env service provider if provided
    if (envServiceProvider) {
      providers.push(envServiceProvider);
    }

    // Add NestJS Cache Module with async configuration
    imports.push(
      NestCacheModule.registerAsync({
        inject: [TEnvService],
        useFactory: (envService: TEnvService) => ({
          stores: [
            createKeyv(
              `redis://${envService.get('REDIS_HOST')}:${envService.get('REDIS_PORT')}`,
            ),
          ],
        }),
      }),
    );

    return {
      module: CacheModule,
      imports,
      providers,
      exports: [TImageCacheService],
      global: true,
    };
  }

  static forRootAsync(options: CacheModuleAsyncOptions): DynamicModule {
    return {
      module: CacheModule,
      imports: [],
      providers: [
        {
          provide: 'CACHE_MODULE_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: CacheModule,
          useFactory: (moduleOptions: CacheModuleOptions) =>
            CacheModule.forRoot(moduleOptions),
          inject: ['CACHE_MODULE_OPTIONS'],
        },
      ],
      exports: [CacheModule],
      global: true,
    };
  }
}
