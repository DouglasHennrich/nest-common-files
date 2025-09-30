# Controllers

## 6. Controllers

**IMPORTANT**: Controllers should inject presenters to format the response data returned by services. Services return raw entities/models, and controllers are responsible for presenting them.

**IMPORTANT**: Always use the complete endpoint path in the @Controller decorator. Do not split route parameters between @Controller and HTTP method decorators (@Get, @Post, etc.). The HTTP method decorators should be empty or contain only query parameters.

Example:
- ✅ `@Controller('entities/:id')` with `@Get()`
- ❌ `@Controller('entities')` with `@Get(':id')`

### 6.1 Create Controller

```typescript
// File: controllers/create-[entity-name].controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ZodValidationPipe } from '@/@shared/pipes/zod-validation.pipe';
import { TCurrentUser } from '@/modules/authenticate/guard/jwt-authenticate.guard';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { CheckPolicies } from '@/modules/authorization/decorators/check-policies.decorator';
import { User } from '@/@decorators/current-user.decorator';
import { ReqContext } from '@/@decorators/request-context.decorator';
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';
import { ApiDocumentation } from '@/@decorators/api-documentation.decorator';
import { Create[EntityName]Policy } from '../policies/create-[entity-name].policy';
import { TCreate[EntityName]Service } from '../services/create-[entity-name].service';
import {
  create[EntityName]DtoBodySchema,
  TCreate[EntityName]DtoBodySchema,
} from '../dto/create-[entity-name].dto';
import { Create[EntityName]Documentation } from '../@docs/create-[entity-name].doc';
import { I[EntityName]Presenter } from '../presenters/[entity-name].presenter';

@Controller('[entity-name-plural]')
export class Create[EntityName]Controller {
  constructor(
    private create[EntityName]Service: TCreate[EntityName]Service,
    private [entityName]Presenter: I[EntityName]Presenter,
  ) {}

  @Post()
  @ApiDocumentation(Create[EntityName]Documentation)
  @CheckPolicies(new Create[EntityName]Policy())
  async create[EntityName](
    @User() user: TCurrentUser,
    @ReqContext() context: IRequestContext,
    @Body(new ZodValidationPipe(create[EntityName]DtoBodySchema))
    create[EntityName]Dto: TCreate[EntityName]DtoBodySchema,
  ) {
    const result = await this.create[EntityName]Service.execute({
      ...create[EntityName]Dto,
      userId: user.id,
      userType: user.userType,
    });

    if (result.error) {
      if (result.error instanceof AbstractApplicationException) {
        result.error.context = context;
      }

      throw result.error;
    }

    return this.[entityName]Presenter.present(result.getValue());
  }
}
```

### 6.2 List Controller - MANDATORY: Pagination

```typescript
// File: controllers/list-[entity-name-plural].controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ZodValidationPipe } from '@/@shared/pipes/zod-validation.pipe';
import { TCurrentUser } from '@/modules/authenticate/guard/jwt-authenticate.guard';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { CheckPolicies } from '@/modules/authorization/decorators/check-policies.decorator';
import { User } from '@/@decorators/current-user.decorator';
import { ReqContext } from '@/@decorators/request-context.decorator';
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';
import { ApiDocumentation } from '@/@decorators/api-documentation.decorator';
import { List[EntityNamePlural]Policy } from '../policies/list-[entity-name-plural].policy';
import { TList[EntityNamePlural]Service } from '../services/list-[entity-name-plural].service';
import {
  list[EntityNamePlural]DtoQuerySchema,
  TList[EntityNamePlural]DtoQuerySchema,
} from '../dto/list-[entity-name-plural].dto';
import { List[EntityNamePlural]Documentation } from '../@docs/list-[entity-name-plural].doc';
import { I[EntityName]Presenter } from '../presenters/[entity-name].presenter';

@Controller('[entity-name-plural]')
export class List[EntityNamePlural]Controller {
  constructor(
    private list[EntityNamePlural]Service: TList[EntityNamePlural]Service,
    private [entityName]Presenter: I[EntityName]Presenter,
  ) {}

  @Get()
  @ApiDocumentation(List[EntityNamePlural]Documentation)
  @CheckPolicies(new List[EntityNamePlural]Policy())
  async list[EntityNamePlural](
    @User() user: TCurrentUser,
    @ReqContext() context: IRequestContext,
    @Query(new ZodValidationPipe(list[EntityNamePlural]DtoQuerySchema))
    list[EntityNamePlural]Dto: TList[EntityNamePlural]DtoQuerySchema,
  ) {
    const result = await this.list[EntityNamePlural]Service.execute({
      ...list[EntityNamePlural]Dto,
      // Add specific contextual fields
      professionalId: user.id, // or other relevant field
      userType: user.userType,
    });

    if (result.error) {
      if (result.error instanceof AbstractApplicationException) {
        result.error.context = context;
      }

      throw result.error;
    }

    const serviceResult = result.getValue();

    return {
      ...serviceResult,
      data: this.[entityName]Presenter.presentMany(serviceResult.data),
    };
  }
}
```

**Mandatory requirements for List Controllers:**
1. **Query DTO**: Must include `page?: number` and `offset?: number`
2. **Context**: Add contextual fields from authenticated user
3. **Return**: `IPagination<T>` with `{ data, total, hasNextPage }`
4. **Documentation**: Include `@ApiDocumentation` with pagination response

### 6.3 Get Controller

```typescript
// File: controllers/get-[entity-name].controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { ZodValidationPipe } from '@/@shared/pipes/zod-validation.pipe';
import { TCurrentUser } from '@/modules/authenticate/guard/jwt-authenticate.guard';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { CheckPolicies } from '@/modules/authorization/decorators/check-policies.decorator';
import { User } from '@/@decorators/current-user.decorator';
import { ReqContext } from '@/@decorators/request-context.decorator';
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';
import { ApiDocumentation } from '@/@decorators/api-documentation.decorator';
import { Get[EntityName]Policy } from '../policies/get-[entity-name].policy';
import { TGet[EntityName]Service } from '../services/get-[entity-name].service';
import {
  get[EntityName]DtoParamSchema,
  TGet[EntityName]DtoParamSchema,
} from '../dto/get-[entity-name].dto';
import { Get[EntityName]Documentation } from '../@docs/get-[entity-name].doc';
import { I[EntityName]Presenter } from '../presenters/[entity-name].presenter';

@Controller('[entity-name-plural]/:id')
export class Get[EntityName]Controller {
  constructor(
    private get[EntityName]Service: TGet[EntityName]Service,
    private [entityName]Presenter: I[EntityName]Presenter,
  ) {}

  @Get()
  @ApiDocumentation(Get[EntityName]Documentation)
  @CheckPolicies(new Get[EntityName]Policy())
  async get[EntityName](
    @User() user: TCurrentUser,
    @ReqContext() context: IRequestContext,
    @Param(new ZodValidationPipe(get[EntityName]DtoParamSchema))
    params: TGet[EntityName]DtoParamSchema,
  ) {
    const result = await this.get[EntityName]Service.execute({
      ...params,
      userId: user.id,
      userType: user.userType,
    });

    if (result.error) {
      if (result.error instanceof AbstractApplicationException) {
        result.error.context = context;
      }

      throw result.error;
    }

    return this.[entityName]Presenter.present(result.getValue());
  }
}
```

### 6.4 Update Controller

```typescript
// File: controllers/update-[entity-name].controller.ts
import { Controller, Put, Param, Body } from '@nestjs/common';
import { ZodValidationPipe } from '@/@shared/pipes/zod-validation.pipe';
import { TCurrentUser } from '@/modules/authenticate/guard/jwt-authenticate.guard';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { CheckPolicies } from '@/modules/authorization/decorators/check-policies.decorator';
import { User } from '@/@decorators/current-user.decorator';
import { ReqContext } from '@/@decorators/request-context.decorator';
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';
import { ApiDocumentation } from '@/@decorators/api-documentation.decorator';
import { Update[EntityName]Policy } from '../policies/update-[entity-name].policy';
import { TUpdate[EntityName]Service } from '../services/update-[entity-name].service';
import {
  update[EntityName]DtoParamSchema,
  update[EntityName]DtoBodySchema,
  TUpdate[EntityName]DtoParamSchema,
  TUpdate[EntityName]DtoBodySchema,
} from '../dto/update-[entity-name].dto';
import { Update[EntityName]Documentation } from '../@docs/update-[entity-name].doc';
import { I[EntityName]Presenter } from '../presenters/[entity-name].presenter';

@Controller('[entity-name-plural]/:id')
export class Update[EntityName]Controller {
  constructor(
    private update[EntityName]Service: TUpdate[EntityName]Service,
    private [entityName]Presenter: I[EntityName]Presenter,
  ) {}

  @Put()
  @ApiDocumentation(Update[EntityName]Documentation)
  @CheckPolicies(new Update[EntityName]Policy())
  async update[EntityName](
    @User() user: TCurrentUser,
    @ReqContext() context: IRequestContext,
    @Param(new ZodValidationPipe(update[EntityName]DtoParamSchema))
    params: TUpdate[EntityName]DtoParamSchema,
    @Body(new ZodValidationPipe(update[EntityName]DtoBodySchema))
    update[EntityName]Dto: TUpdate[EntityName]DtoBodySchema,
  ) {
    const result = await this.update[EntityName]Service.execute({
      ...params,
      ...update[EntityName]Dto,
      userId: user.id,
      userType: user.userType,
    });

    if (result.error) {
      if (result.error instanceof AbstractApplicationException) {
        result.error.context = context;
      }

      throw result.error;
    }

    return this.[entityName]Presenter.present(result.getValue());
  }
}
```

### 6.5 Delete Controller

```typescript
// File: controllers/delete-[entity-name].controller.ts
import { Controller, Delete, Param } from '@nestjs/common';
import { ZodValidationPipe } from '@/@shared/pipes/zod-validation.pipe';
import { TCurrentUser } from '@/modules/authenticate/guard/jwt-authenticate.guard';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { CheckPolicies } from '@/modules/authorization/decorators/check-policies.decorator';
import { User } from '@/@decorators/current-user.decorator';
import { ReqContext } from '@/@decorators/request-context.decorator';
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';
import { ApiDocumentation } from '@/@decorators/api-documentation.decorator';
import { Delete[EntityName]Policy } from '../policies/delete-[entity-name].policy';
import { TDelete[EntityName]Service } from '../services/delete-[entity-name].service';
import {
  delete[EntityName]DtoParamSchema,
  TDelete[EntityName]DtoParamSchema,
} from '../dto/delete-[entity-name].dto';
import { Delete[EntityName]Documentation } from '../@docs/delete-[entity-name].doc';

@Controller('[entity-name-plural]/:id')
export class Delete[EntityName]Controller {
  constructor(private delete[EntityName]Service: TDelete[EntityName]Service) {}

  @Delete()
  @ApiDocumentation(Delete[EntityName]Documentation)
  @CheckPolicies(new Delete[EntityName]Policy())
  async delete[EntityName](
    @User() user: TCurrentUser,
    @ReqContext() context: IRequestContext,
    @Param(new ZodValidationPipe(delete[EntityName]DtoParamSchema))
    params: TDelete[EntityName]DtoParamSchema,
  ) {
    const result = await this.delete[EntityName]Service.execute({
      ...params,
      userId: user.id,
      userType: user.userType,
    });

    if (result.error) {
      if (result.error instanceof AbstractApplicationException) {
        result.error.context = context;
      }

      throw result.error;
    }

    return result.getValue();
  }
}
```