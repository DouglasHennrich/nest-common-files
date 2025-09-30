# Services

## 4. Services

**IMPORTANT**: Services should NOT use presenters. Presenters should only be used in controllers to format the response data. Services should return raw entities/models.

### 4.1 Create Service

```typescript
// File: services/create-[entity-name].service.ts
import { Injectable } from '@nestjs/common';
import { ILogger, CustomLogger } from '@/@shared/classes/custom-logger';
import { Result } from '@/@shared/classes/result';
import { AbstractService } from '@/@shared/classes/service';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { DefaultException } from '@/@shared/errors/abstract-application-exception';
import {
  create[EntityName]DtoServiceSchema,
  TCreate[EntityName]DtoServiceSchema,
} from '../dto/create-[entity-name].dto';
import { I[EntityNamePlural]Repository } from '../repositories/[entity-name-plural].repository';
import { I[EntityName]Model } from '../models/[entity-name].struct';

export abstract class TCreate[EntityName]Service extends AbstractService<
  TCreate[EntityName]DtoServiceSchema,
  I[EntityName]Model
> {}

@Injectable()
export class Create[EntityName]Service implements TCreate[EntityName]Service {
  public logger: ILogger = new CustomLogger(Create[EntityName]Service.name);

  constructor(
    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    private [entityNamePlural]Repository: I[EntityNamePlural]Repository,
  ) {}

  async execute(
    serviceDto: TCreate[EntityName]DtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<I[EntityName]Model>> {
    const validateDtoResult = await this.validateDto(serviceDto, context);

    if (validateDtoResult.error) {
      return Result.fail(validateDtoResult.error);
    }

    const validatedDto = validateDtoResult.getValue()!;

    this.logger.log(
      `Creating [entity-name]: ${JSON.stringify(validatedDto)}`,
    );

    const [entityName] = await this.[entityNamePlural]Repository.create(validatedDto);

    return Result.success([entityName]);
  }

  async validateDto(
    serviceDto: TCreate[EntityName]DtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<TCreate[EntityName]DtoServiceSchema>> {
    try {
      const validatedDto = create[EntityName]DtoServiceSchema.parse(serviceDto);

      // Additional business validations here

      return Result.success(validatedDto);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
```

### 4.2 List Service - MANDATORY: Pagination with IPagination

```typescript
// File: services/list-[entity-name-plural].service.ts
import { Injectable } from '@nestjs/common';
import { Result } from '@/@shared/classes/result';
import { AbstractService } from '@/@shared/classes/service';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { IPagination } from '@/@shared/classes/repository';
import { TEnvService } from '@/modules/env/services/env.service';
import { enumFromStringValue } from '@/@shared/utils/enumFromStringValue';
import { InvalidEnumCaseException } from '@/@shared/errors/invalid-enum-case.exception';
import { ILogger, CustomLogger } from '@/@shared/classes/custom-logger';
import {
  list[EntityNamePlural]DtoServiceSchema,
  TList[EntityNamePlural]DtoServiceSchema,
} from '../dto/list-[entity-name-plural].dto';
import { I[EntityNamePlural]Repository } from '../repositories/[entity-name-plural].repository';
import { I[EntityName]Model } from '../models/[entity-name].struct';

export abstract class TList[EntityNamePlural]Service extends AbstractService<
  TList[EntityNamePlural]DtoServiceSchema,
  IPagination<I[EntityName]Model>
> {}

@Injectable()
export class List[EntityNamePlural]Service implements TList[EntityNamePlural]Service {
  public logger: ILogger = new CustomLogger(List[EntityNamePlural]Service.name);

  constructor(
    /// //////////////////////////
    //  Services
    /// //////////////////////////
    private envService: TEnvService,

    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    private [entityNamePlural]Repository: I[EntityNamePlural]Repository,
  ) {}

  async execute({
    page = 1,
    offset = this.envService.get('UTILITIES_PAGINATION_LIMIT'),
    // other specific filters
    status,
    type,
    professionalId,
  }: TList[EntityNamePlural]DtoServiceSchema): Promise<
    Result<IPagination<I[EntityName]Model>>
  > {
    const validateDtoResult = this.validateDto({
      page,
      offset,
      status,
      type,
      professionalId,
    });

    if (validateDtoResult.error) {
      return Result.fail(validateDtoResult.error);
    }

    this.logger.log('Listing [entity-name-plural]');

    // Build WHERE conditions
    const whereConditions: any[] = [];

    if (status) {
      const statusAsEnum = enumFromStringValue(status, StatusEnum);
      whereConditions.push({ status: statusAsEnum });
    }

    if (type) {
      const typeAsEnum = enumFromStringValue(type, TypeEnum);
      whereConditions.push({ type: typeAsEnum });
    }

    const {
      data: [entityNamePlural],
      hasNextPage,
      total,
    } = await this.[entityNamePlural]Repository.find({
      where: whereConditions,
      offset,
      page,
      order: {
        createdAt: 'DESC',
      },
    });

    return Result.success({
      total,
      hasNextPage,
      data: [entityNamePlural],
    });
  }

  validateDto(
    serviceDto: TList[EntityNamePlural]DtoServiceSchema,
  ): Result<TList[EntityNamePlural]DtoServiceSchema> {
    try {
      const validatedDto = list[EntityNamePlural]DtoServiceSchema.parse(serviceDto);

      // Validate optional enums
      if (validatedDto.status) {
        const statusAsEnum = enumFromStringValue(validatedDto.status, StatusEnum);
        if (!statusAsEnum) {
          return Result.fail(
            new InvalidEnumCaseException(StatusEnum, 'status'),
          );
        }
      }

      if (validatedDto.type) {
        const typeAsEnum = enumFromStringValue(validatedDto.type, TypeEnum);
        if (!typeAsEnum) {
          return Result.fail(
            new InvalidEnumCaseException(TypeEnum, 'type'),
          );
        }
      }

      return Result.success(validatedDto);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
```

**Mandatory requirements for List Services:**
1. **Return type**: `IPagination<I[EntityName]Model>`
2. **EnvService injection**: To access `UTILITIES_PAGINATION_LIMIT`
3. **Parameters with defaults**: `page = 1`, `offset = this.envService.get('UTILITIES_PAGINATION_LIMIT')`
4. **Enum validation**: Use `enumFromStringValue` for all enum filters
5. **Structured return**: `{ total, hasNextPage, data }`
6. **WHERE construction**: Create `whereConditions` array for conditional filters

### 4.3 Get Service

```typescript
// File: services/get-[entity-name].service.ts
import { Injectable } from '@nestjs/common';
import { Result } from '@/@shared/classes/result';
import { AbstractService } from '@/@shared/classes/service';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { ILogger, CustomLogger } from '@/@shared/classes/custom-logger';
import {
  get[EntityName]DtoServiceSchema,
  TGet[EntityName]DtoServiceSchema,
} from '../dto/get-[entity-name].dto';
import { I[EntityNamePlural]Repository } from '../repositories/[entity-name-plural].repository';
import { I[EntityName]Model } from '../models/[entity-name].struct';
import { [EntityName]NotFoundException } from '../errors/[entity-name]-not-found.exception';

export abstract class TGet[EntityName]Service extends AbstractService<
  TGet[EntityName]DtoServiceSchema,
  I[EntityName]Model
> {}

@Injectable()
export class Get[EntityName]Service implements TGet[EntityName]Service {
  public logger: ILogger = new CustomLogger(Get[EntityName]Service.name);

  constructor(
    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    private [entityNamePlural]Repository: I[EntityNamePlural]Repository,

  ) {}

  async execute(
    serviceDto: TGet[EntityName]DtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<I[EntityName]Model>> {
    const validateDtoResult = await this.validateDto(serviceDto, context);

    if (validateDtoResult.error) {
      return Result.fail(validateDtoResult.error);
    }

    const validatedDto = validateDtoResult.getValue()!;

    this.logger.log(
      `Getting [entity-name]: ${JSON.stringify(validatedDto)}`,
    );

    const [entityName] = await this.[entityNamePlural]Repository.findById(validatedDto.id);

    if (![entityName]) {
      return Result.fail(new [EntityName]NotFoundException(validatedDto.id, context));
    }

    return Result.success([entityName]);
  }

  async validateDto(
    serviceDto: TGet[EntityName]DtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<TGet[EntityName]DtoServiceSchema>> {
    try {
      const validatedDto = get[EntityName]DtoServiceSchema.parse(serviceDto);

      return Result.success(validatedDto);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
```

### 4.4 Update Service

```typescript
// File: services/update-[entity-name].service.ts
import { Injectable } from '@nestjs/common';
import { Result } from '@/@shared/classes/result';
import { AbstractService } from '@/@shared/classes/service';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { ILogger, CustomLogger } from '@/@shared/classes/custom-logger';
import {
  update[EntityName]DtoServiceSchema,
  TUpdate[EntityName]DtoServiceSchema,
} from '../dto/update-[entity-name].dto';
import { I[EntityNamePlural]Repository } from '../repositories/[entity-name-plural].repository';
import { I[EntityName]Model } from '../models/[entity-name].struct';
import { [EntityName]NotFoundException } from '../errors/[entity-name]-not-found.exception';

export abstract class TUpdate[EntityName]Service extends AbstractService<
  TUpdate[EntityName]DtoServiceSchema,
  I[EntityName]Model
> {}

@Injectable()
export class Update[EntityName]Service implements TUpdate[EntityName]Service {
  public logger: ILogger = new CustomLogger(Update[EntityName]Service.name);

  constructor(
    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    private [entityNamePlural]Repository: I[EntityNamePlural]Repository,

  async execute(
    serviceDto: TUpdate[EntityName]DtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<I[EntityName]Model>> {
    const validateDtoResult = await this.validateDto(serviceDto, context);

    if (validateDtoResult.error) {
      return Result.fail(validateDtoResult.error);
    }

    const validatedDto = validateDtoResult.getValue()!;

    this.logger.log(
      `Updating [entity-name]: ${JSON.stringify(validatedDto)}`,
    );

    const [entityName] = await this.[entityNamePlural]Repository.findById(validatedDto.id);

    if (![entityName]) {
      return Result.fail(new [EntityName]NotFoundException(validatedDto.id, context));
    }

    const [updated[EntityName]] = await this.[entityNamePlural]Repository.update({
      id: validatedDto.id,
      ...validatedDto,
    });

    return Result.success([updated[EntityName]]);
  }

  async validateDto(
    serviceDto: TUpdate[EntityName]DtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<TUpdate[EntityName]DtoServiceSchema>> {
    try {
      const validatedDto = update[EntityName]DtoServiceSchema.parse(serviceDto);

      return Result.success(validatedDto);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
```

### 4.5 Delete Service

```typescript
// File: services/delete-[entity-name].service.ts
import { Injectable } from '@nestjs/common';
import { Result } from '@/@shared/classes/result';
import { AbstractService } from '@/@shared/classes/service';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { ILogger, CustomLogger } from '@/@shared/classes/custom-logger';
import {
  delete[EntityName]DtoServiceSchema,
  TDelete[EntityName]DtoServiceSchema,
} from '../dto/delete-[entity-name].dto';
import { I[EntityNamePlural]Repository } from '../repositories/[entity-name-plural].repository';
import { [EntityName]NotFoundException } from '../errors/[entity-name]-not-found.exception';

export abstract class TDelete[EntityName]Service extends AbstractService<
  TDelete[EntityName]DtoServiceSchema,
  { message: string }
> {}

@Injectable()
export class Delete[EntityName]Service implements TDelete[EntityName]Service {
  public logger: ILogger = new CustomLogger(Delete[EntityName]Service.name);

  constructor(
    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    private [entityNamePlural]Repository: I[EntityNamePlural]Repository,
  ) {}

  async execute(
    serviceDto: TDelete[EntityName]DtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<{ message: string }>> {
    const validateDtoResult = await this.validateDto(serviceDto, context);

    if (validateDtoResult.error) {
      return Result.fail(validateDtoResult.error);
    }

    const validatedDto = validateDtoResult.getValue()!;

    this.logger.log(
      `Deleting [entity-name]: ${JSON.stringify(validatedDto)}`,
    );

    const [entityName] = await this.[entityNamePlural]Repository.findById(validatedDto.id);

    if (![entityName]) {
      return Result.fail(new [EntityName]NotFoundException(validatedDto.id, context));
    }

    await this.[entityNamePlural]Repository.delete(validatedDto.id);

    return Result.success({
      message: '[EntityName] deleted successfully',
    });
  }

  async validateDto(
    serviceDto: TDelete[EntityName]DtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<TDelete[EntityName]DtoServiceSchema>> {
    try {
      const validatedDto = delete[EntityName]DtoServiceSchema.parse(serviceDto);

      return Result.success(validatedDto);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
```