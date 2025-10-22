# NestJS Common Shareds

A comprehensive shared utilities and abstractions module for NestJS applications.

## Installation

```bash
npm install @douglashennrich/nestjs-common-shareds
# or
pnpm add @douglashennrich/nestjs-common-shareds
```

## Quick Start

```typescript
import { CommonSharedsModule, TEnvService } from '@douglashennrich/nestjs-common-shareds';

@Injectable()
export class MyEnvService implements TEnvService {
  get<T extends string>(key: T): any {
    return process.env[key];
  }
}

@Module({
  imports: [
    CommonSharedsModule.forRoot({
      envServiceProvider: {
        provide: TEnvService,
        useClass: MyEnvService,
      },
      cacheEnabled: true, // Enable cache module
      loggerEnabled: true, // Enable logger (default: true)
    }),
  ],
})
export class AppModule {}
```

## Module Options

The `CommonSharedsModule.forRoot()` and `CommonSharedsModule.forRootAsync()` accept the following options:

- `envServiceProvider`: Provider for `TEnvService` (required for classes that use environment variables)
- `cacheEnabled`: Whether to enable the cache module with Redis support (default: `false`)
- `loggerEnabled`: Whether to enable the custom logger (default: `true`)

## Dependency Injection

The module uses abstract interfaces for dependency injection, allowing you to easily override implementations:

- `ILogger` → `CustomLogger`
- `TImageCacheService` → `ImageCacheService`
- `TEnvService` → Your custom implementation

This follows NestJS best practices for testability and flexibility.

### Using forRootAsync with External Modules

If your `TEnvService` implementation depends on external modules, use `forRootAsync`:

```typescript
// Example: If you have an EnvModule that exports TEnvService
@Module({
  providers: [
    {
      provide: TEnvService,
      useClass: EnvService, // Your concrete implementation
    },
  ],
  exports: [TEnvService],
})
export class EnvModule {}

@Module({
  imports: [
    EnvModule, // This module provides TEnvService
    CommonSharedsModule.forRootAsync({
      inject: [TEnvService], // Inject the service from EnvModule
      useFactory: (envService: TEnvService) => ({
        envServiceProvider: {
          provide: TEnvService,
          useExisting: TEnvService, // Use the injected instance
        },
        cacheEnabled: true,
        loggerEnabled: true,
      }),
    }),
  ],
})
export class AppModule {}
```

For dynamic configuration based on other services:

```typescript
CommonSharedsModule.forRootAsync({
  inject: [ConfigService], // Inject from @nestjs/config
  useFactory: (configService: ConfigService) => ({
    envServiceProvider: {
      provide: TEnvService,
      useClass: MyEnvService,
    },
    cacheEnabled: configService.get('CACHE_ENABLED', false),
    loggerEnabled: configService.get('LOGGER_ENABLED', true),
  }),
})
```

## Features

- **Abstract Classes**: Base classes for services, repositories, presenters, and results
- **Custom Logger**: Enhanced logging with context support
- **Error Handling**: Abstract application exception classes
- **Utilities**: Date utilities, random generation, normalization
- **Schemas**: Zod validation schemas
- **Protocols**: Request context and environment service interfaces
- **Modules**: Logger module and cache module with image caching

## Usage

### Environment Service

To use the shared classes that depend on environment variables, you need to provide an implementation of `TEnvService`:

```typescript
import { TEnvService } from '@douglashennrich/nestjs-common-shareds';

@Injectable()
export class EnvService implements TEnvService {
  get<T extends string>(key: T): any {
    // Your implementation
  }
}
```

### Abstract Repository

```typescript
import { AbstractRepository } from '@douglashennrich/nestjs-common-shareds';

@Injectable()
export class MyRepository extends AbstractRepository<MyEntity> {
  // Implement your repository methods
}
```

### Abstract Service

```typescript
import { AbstractService } from '@douglashennrich/nestjs-common-shareds';

export abstract class MyService extends AbstractService<MyDto, MyResponse> {
  // Implement your service logic
}
```

### Result Class

```typescript
import { Result } from '@douglashennrich/nestjs-common-shareds';

const result = Result.success(data);
// or
const errorResult = Result.fail(new Error('Something went wrong'));
```

## Dependencies

This package has the following peer dependencies:

- @nestjs/common
- @nestjs/swagger
- @nestjs/platform-express
- @nestjs/cache-manager
- typeorm
- zod
- date-fns
- axios
- reflect-metadata
- rxjs
- @types/multer
- multer
- slugify
- @keyv/redis

Make sure to install them in your project.