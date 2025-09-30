# Instrução Completa para Criação de Módulo NestJS

## Fluxo Completo: Model → Entity → Repository → Controller → Presenter → Module

**IMPORTANTE**: Use presenters diretamente nos controllers ao invés de services para operações de leitura. Services devem ser usados apenas para operações de escrita (create, update, delete) que envolvem lógica de negócio complexa.

**IMPORTANTE**: Sempre use o endpoint completo no decorator @Controller. Não divida parâmetros de rota entre @Controller e decoradores HTTP (@Get, @Post, etc.). Os decoradores HTTP devem estar vazios ou conter apenas parâmetros de query.

Exemplo:
- ✅ `@Controller('entities/:id')` com `@Get()`
- ❌ `@Controller('entities')` com `@Get(':id')`


### 1. Model (Interface)

#### 1.1 Estrutura Base
```typescript
// Arquivo: models/[nome-fornecido].struct.ts
export interface I[NomeFornecido]Model {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  // Propriedades específicas da entidade
  nome: string;
  descricao?: string;

  /// //////////////////////////
  //  Relations
  /// //////////////////////////
  // Definir relacionamentos aqui
  // Sempre use o padrão:
  // relatedEntity?: IRelatedEntityModel | null | undefined;
}
```


### 2. Entity (TypeORM)

#### 2.1 Estrutura Base
```typescript
// Arquivo: entities/[nome-fornecido].entity.ts
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { I[NomeFornecido]Model } from '../models/[nome-fornecido].struct';

@Entity('[nome-fornecido-plural]')
export class [NomeFornecido]Entity implements I[NomeFornecido]Model {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  // Propriedades específicas
  @Column()
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  /// //////////////////////////
  //  Relations
  /// //////////////////////////
  // Definir relacionamentos aqui
  // Sempre use o padrão:
  // @ManyToOne(() => RelatedEntity, (related) => related.entities)
  // @JoinColumn({ name: 'related_entity_id' })
  // relatedEntity?: RelatedEntity | null | undefined;
}
```

#### 2.2 Relacionamentos
```typescript
// One-to-Many
@OneToMany(() => OutraEntity, (outra) => outra.entidade)
outrasEntidades: OutraEntity[];

// Many-to-One
@ManyToOne(() => OutraEntity, (outra) => outra.entidades)
@JoinColumn({ name: 'outra_entity_id' })
outraEntity: OutraEntity;

@Column({ name: 'outra_entity_id' })
outraEntityId: string;
```

### 3. Repository

#### 3.1 Interface e Implementação
```typescript
// Arquivo: repositories/[nome-fornecido-plural].repository.ts
import { Injectable } from '@nestjs/common';
import { [NomeFornecido]Entity } from '../entities/[nome-fornecido].entity';
import { AbstractRepository } from '@/@shared/classes/repository';
import { I[NomeFornecido]Model } from '../models/[nome-fornecido].struct';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TEnvironment } from '@/modules/env/env';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '@/@shared/classes/custom-logger';

export class I[NomeFornecidoPlural]Repository extends AbstractRepository<
  [NomeFornecido]Entity,
  I[NomeFornecido]Model
> {}

@Injectable()
export class [NomeFornecidoPlural]Repository extends I[NomeFornecidoPlural]Repository {
  constructor(
    @InjectRepository([NomeFornecido]Entity)
    readonly [nomeFornecido]Repository: Repository<[NomeFornecido]Entity>,
    readonly envService: TEnvService,
  ) {
    super([nomeFornecido]Repository, configService, new CustomLogger([NomeFornecidoPlural]Repository.name));
  }
}
```

### 4. Services

#### 4.1 Create Service
```typescript
// Arquivo: services/create-[nome-fornecido].service.ts
import { Injectable } from '@nestjs/common';
import { ILogger, CustomLogger } from '@/@shared/classes/custom-logger';
import { Result } from '@/@shared/classes/result';
import { AbstractService } from '@/@shared/classes/service';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { DefaultException } from '@/@shared/errors/abstract-application-exception';
import {
  create[NomeFornecido]DtoServiceSchema,
  TCreate[NomeFornecido]DtoServiceSchema,
} from '../dto/create-[nome-fornecido].dto';
import { I[NomeFornecidoPlural]Repository } from '../repositories/[nome-fornecido-plural].repository';
import {
  I[NomeFornecido]Presenter,
  T[NomeFornecido]PresenterResponse,
} from '../presenters/[nome-fornecido].presenter';

export abstract class TCreate[NomeFornecido]Service extends AbstractService<
  TCreate[NomeFornecido]DtoServiceSchema,
  T[NomeFornecido]PresenterResponse
> {}

@Injectable()
export class Create[NomeFornecido]Service implements TCreate[NomeFornecido]Service {
  public logger: ILogger = new CustomLogger(Create[NomeFornecido]Service.name);

  constructor(
    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    private [nomeFornecidoPlural]Repository: I[NomeFornecidoPlural]Repository,

    /// //////////////////////////
    //  Presenter
    /// //////////////////////////
    private [nomeFornecido]Presenter: I[NomeFornecido]Presenter,
  ) {}

  async execute(
    serviceDto: TCreate[NomeFornecido]DtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<T[NomeFornecido]PresenterResponse>> {
    const validateDtoResult = await this.validateDto(serviceDto, context);

    if (validateDtoResult.error) {
      return Result.fail(validateDtoResult.error);
    }

    const validatedDto = validateDtoResult.getValue()!;

    this.logger.log(
      `Creating [nome-fornecido]: ${JSON.stringify(validatedDto)}`,
    );

    const [nomeFornecido] = await this.[nomeFornecidoPlural]Repository.create(validatedDto);

    return Result.success(
      this.[nomeFornecido]Presenter.present([nomeFornecido]),
    );
  }

  async validateDto(
    serviceDto: TCreate[NomeFornecido]DtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<TCreate[NomeFornecido]DtoServiceSchema>> {
    try {
      const validatedDto = create[NomeFornecido]DtoServiceSchema.parse(serviceDto);

      // Validações adicionais de negócio aqui
      
      return Result.success(validatedDto);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
```

#### 4.2 List Service - OBRIGATÓRIO: Paginação com IPagination
```typescript
// Arquivo: services/list-[nome-fornecido-plural].service.ts
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
  list[NomeFornecidoPlural]DtoServiceSchema,
  TList[NomeFornecidoPlural]DtoServiceSchema,
} from '../dto/list-[nome-fornecido-plural].dto';
import { I[NomeFornecidoPlural]Repository } from '../repositories/[nome-fornecido-plural].repository';
import {
  I[NomeFornecido]Presenter,
  T[NomeFornecido]PresenterResponse,
} from '../presenters/[nome-fornecido].presenter';

export abstract class TList[NomeFornecidoPlural]Service extends AbstractService<
  TList[NomeFornecidoPlural]DtoServiceSchema,
  IPagination<T[NomeFornecido]PresenterResponse>
> {}

@Injectable()
export class List[NomeFornecidoPlural]Service implements TList[NomeFornecidoPlural]Service {
  public logger: ILogger = new CustomLogger(List[NomeFornecidoPlural]Service.name);

  constructor(
    /// //////////////////////////
    //  Services
    /// //////////////////////////
    private envService: TEnvService,

    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    private [nomeFornecidoPlural]Repository: I[NomeFornecidoPlural]Repository,

    /// //////////////////////////
    //  Presenter
    /// //////////////////////////
    private [nomeFornecido]Presenter: I[NomeFornecido]Presenter,
  ) {}

  async execute({
    page = 1,
    offset = this.envService.get('UTILITIES_PAGINATION_LIMIT'),
    // outros filtros específicos do modelo
    status,
    type,
    professionalId,
  }: TList[NomeFornecidoPlural]DtoServiceSchema): Promise<
    Result<IPagination<T[NomeFornecido]PresenterResponse>>
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

    this.logger.log('Listing [nome-fornecido-plural]');

    // Construir condições WHERE
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
      data: [nomeFornecidoPlural],
      hasNextPage,
      total,
    } = await this.[nomeFornecidoPlural]Repository.find({
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
      data: this.[nomeFornecido]Presenter.presentMany([nomeFornecidoPlural]),
    });
  }

  validateDto(
    serviceDto: TList[NomeFornecidoPlural]DtoServiceSchema,
  ): Result<TList[NomeFornecidoPlural]DtoServiceSchema> {
    try {
      const validatedDto = list[NomeFornecidoPlural]DtoServiceSchema.parse(serviceDto);
      
      // Validar enums opcionais
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

**Requisitos obrigatórios para List Services:**
1. **Tipo de retorno**: `IPagination<TPresenterResponse>`
2. **Injeção do EnvService**: Para acessar `UTILITIES_PAGINATION_LIMIT`
3. **Parâmetros com defaults**: `page = 1`, `offset = this.envService.get('UTILITIES_PAGINATION_LIMIT')`
4. **Validação de enums**: Usar `enumFromStringValue` para todos os filtros de enum
5. **Retorno estruturado**: `{ total, hasNextPage, data }`
6. **Construção de WHERE**: Criar array `whereConditions` para filtros condicionais

#### 4.3 Get Service
```typescript
// Arquivo: services/get-[nome-fornecido].service.ts
import { Injectable } from '@nestjs/common';
import { Result } from '@/@shared/classes/result';
import { AbstractService } from '@/@shared/classes/service';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { ILogger, CustomLogger } from '@/@shared/classes/custom-logger';
import {
  get[NomeFornecido]DtoServiceSchema,
  TGet[NomeFornecido]DtoServiceSchema,
} from '../dto/get-[nome-fornecido].dto';
import { I[NomeFornecidoPlural]Repository } from '../repositories/[nome-fornecido-plural].repository';
import {
  I[NomeFornecido]Presenter,
  T[NomeFornecido]PresenterResponse,
} from '../presenters/[nome-fornecido].presenter';
import { [NomeFornecido]NotFoundException } from '../errors/[nome-fornecido]-not-found.exception';

export abstract class TGet[NomeFornecido]Service extends AbstractService<
  TGet[NomeFornecido]DtoServiceSchema,
  T[NomeFornecido]PresenterResponse
> {}

@Injectable()
export class Get[NomeFornecido]Service implements TGet[NomeFornecido]Service {
  public logger: ILogger = new CustomLogger(Get[NomeFornecido]Service.name);

  constructor(
    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    private [nomeFornecidoPlural]Repository: I[NomeFornecidoPlural]Repository,

    /// //////////////////////////
    //  Presenter
    /// //////////////////////////
    private [nomeFornecido]Presenter: I[NomeFornecido]Presenter,
  ) {}

  async execute(
    serviceDto: TGet[NomeFornecido]DtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<T[NomeFornecido]PresenterResponse>> {
    const validateDtoResult = await this.validateDto(serviceDto, context);

    if (validateDtoResult.error) {
      return Result.fail(validateDtoResult.error);
    }

    const validatedDto = validateDtoResult.getValue()!;

    this.logger.log(
      `Getting [nome-fornecido]: ${JSON.stringify(validatedDto)}`,
    );

    const [nomeFornecido] = await this.[nomeFornecidoPlural]Repository.findById(validatedDto.id);

    if (![nomeFornecido]) {
      return Result.fail(new [NomeFornecido]NotFoundException(validatedDto.id, context));
    }

    return Result.success(
      this.[nomeFornecido]Presenter.present([nomeFornecido]),
    );
  }

  async validateDto(
    serviceDto: TGet[NomeFornecido]DtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<TGet[NomeFornecido]DtoServiceSchema>> {
    try {
      const validatedDto = get[NomeFornecido]DtoServiceSchema.parse(serviceDto);
      
      return Result.success(validatedDto);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
```

#### 4.4 Update Service

```typescript
// Arquivo: services/update-[nome-fornecido].service.ts
import { Injectable } from '@nestjs/common';
import { Result } from '@/@shared/classes/result';
import { AbstractService } from '@/@shared/classes/service';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { ILogger, CustomLogger } from '@/@shared/classes/custom-logger';
import {
  update[NomeFornecido]DtoServiceSchema,
  TUpdate[NomeFornecido]DtoServiceSchema,
} from '../dto/update-[nome-fornecido].dto';
import { I[NomeFornecidoPlural]Repository } from '../repositories/[nome-fornecido-plural].repository';
import {
  I[NomeFornecido]Presenter,
  T[NomeFornecido]PresenterResponse,
} from '../presenters/[nome-fornecido].presenter';
import { [NomeFornecido]NotFoundException } from '../errors/[nome-fornecido]-not-found.exception';

export abstract class TUpdate[NomeFornecido]Service extends AbstractService<
  TUpdate[NomeFornecido]DtoServiceSchema,
  T[NomeFornecido]PresenterResponse
> {}

@Injectable()
export class Update[NomeFornecido]Service implements TUpdate[NomeFornecido]Service {
  public logger: ILogger = new CustomLogger(Update[NomeFornecido]Service.name);

  constructor(
    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    private [nomeFornecidoPlural]Repository: I[NomeFornecidoPlural]Repository,

    /// //////////////////////////
    //  Presenter
    /// //////////////////////////
    private [nomeFornecido]Presenter: I[NomeFornecido]Presenter,
  ) {}

  async execute(
    serviceDto: TUpdate[NomeFornecido]DtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<T[NomeFornecido]PresenterResponse>> {
    const validateDtoResult = await this.validateDto(serviceDto, context);

    if (validateDtoResult.error) {
      return Result.fail(validateDtoResult.error);
    }

    const validatedDto = validateDtoResult.getValue()!;

    this.logger.log(
      `Updating [nome-fornecido]: ${JSON.stringify(validatedDto)}`,
    );

    const [nomeFornecido] = await this.[nomeFornecidoPlural]Repository.findById(validatedDto.id);

    if (![nomeFornecido]) {
      return Result.fail(new [NomeFornecido]NotFoundException(validatedDto.id, context));
    }

    const [updated[NomeFornecido]] = await this.[nomeFornecidoPlural]Repository.update({
      id: validatedDto.id,
      ...validatedDto,
    });

    return Result.success(
      this.[nomeFornecido]Presenter.present([updated[NomeFornecido]]),
    );
  }

  async validateDto(
    serviceDto: TUpdate[NomeFornecido]DtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<TUpdate[NomeFornecido]DtoServiceSchema>> {
    try {
      const validatedDto = update[NomeFornecido]DtoServiceSchema.parse(serviceDto);
      
      return Result.success(validatedDto);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
```

#### 4.5 Delete Service

```typescript
// Arquivo: services/delete-[nome-fornecido].service.ts
import { Injectable } from '@nestjs/common';
import { Result } from '@/@shared/classes/result';
import { AbstractService } from '@/@shared/classes/service';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { ILogger, CustomLogger } from '@/@shared/classes/custom-logger';
import {
  delete[NomeFornecido]DtoServiceSchema,
  TDelete[NomeFornecido]DtoServiceSchema,
} from '../dto/delete-[nome-fornecido].dto';
import { I[NomeFornecidoPlural]Repository } from '../repositories/[nome-fornecido-plural].repository';
import { [NomeFornecido]NotFoundException } from '../errors/[nome-fornecido]-not-found.exception';

export abstract class TDelete[NomeFornecido]Service extends AbstractService<
  TDelete[NomeFornecido]DtoServiceSchema,
  { message: string }
> {}

@Injectable()
export class Delete[NomeFornecido]Service implements TDelete[NomeFornecido]Service {
  public logger: ILogger = new CustomLogger(Delete[NomeFornecido]Service.name);

  constructor(
    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    private [nomeFornecidoPlural]Repository: I[NomeFornecidoPlural]Repository,
  ) {}

  async execute(
    serviceDto: TDelete[NomeFornecido]DtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<{ message: string }>> {
    const validateDtoResult = await this.validateDto(serviceDto, context);

    if (validateDtoResult.error) {
      return Result.fail(validateDtoResult.error);
    }

    const validatedDto = validateDtoResult.getValue()!;

    this.logger.log(
      `Deleting [nome-fornecido]: ${JSON.stringify(validatedDto)}`,
    );

    const [nomeFornecido] = await this.[nomeFornecidoPlural]Repository.findById(validatedDto.id);

    if (![nomeFornecido]) {
      return Result.fail(new [NomeFornecido]NotFoundException(validatedDto.id, context));
    }

    await this.[nomeFornecidoPlural]Repository.delete(validatedDto.id);

    return Result.success({
      message: '[NomeFornecido] deleted successfully',
    });
  }

  async validateDto(
    serviceDto: TDelete[NomeFornecido]DtoServiceSchema,
    context?: IRequestContext,
  ): Promise<Result<TDelete[NomeFornecido]DtoServiceSchema>> {
    try {
      const validatedDto = delete[NomeFornecido]DtoServiceSchema.parse(serviceDto);
      
      return Result.success(validatedDto);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
```

### 5. DTOs com Zod

#### 5.0 Padrões de Transformação Zod

**OBRIGATÓRIO**: Use `z.nativeEnum()` para enums:

##### 5.0.1 Enums
```typescript
// ❌ Evitar: z.enum(Object.values(MyEnum) as [string, ...string[]])
// ✅ Usar:
z.nativeEnum(MyEnum)
z.nativeEnum(StatusEnum).optional()
```

##### 5.0.2 Conversão String → Number
```typescript
// ❌ Evitar: z.coerce.number()
// ✅ Usar:
z.union([
  z.string().transform((value) => parseInt(value, 10)),
  z.number(),
]).pipe(z.number().int().min(1))
```

##### 5.0.3 Conversão String → Boolean
```typescript
// Para valores como 'true', '1', 'false', '0'
z.union([
  z.string().transform((value) => value === 'true' || value === '1'),
  z.boolean(),
])
```

##### 5.0.4 Conversão String → Date
```typescript
z.coerse.date()
```

#### 5.1 Create DTO

```typescript
// Arquivo: dto/create-[nome-fornecido].dto.ts
import { z } from 'zod';

export const create[NomeFornecido]DtoBodySchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional(),
  // Exemplo de campo numérico opcional
  idade: z
    .union([
      z.string().transform((value) => parseInt(value, 10)),
      z.number(),
    ])
    .pipe(z.number().int().min(1))
    .optional(),
  // Exemplo de campo booleano opcional
  ativo: z
    .union([
      z.string().transform((value) => value === 'true' || value === '1'),
      z.boolean(),
    ])
    .optional(),
});

export const create[NomeFornecido]DtoServiceSchema = create[NomeFornecido]DtoBodySchema.extend({
  professionalId: z.string().uuid(),
  professionalType: z.nativeEnum(ProfessionalTypeEnum),
});

export type TCreate[NomeFornecido]DtoBodySchema = z.infer<typeof create[NomeFornecido]DtoBodySchema>;
export type TCreate[NomeFornecido]DtoServiceSchema = z.infer<typeof create[NomeFornecido]DtoServiceSchema>;
```

#### 5.2 List DTO - OBRIGATÓRIO: Paginação
```typescript
// Arquivo: dto/list-[nome-fornecido-plural].dto.ts
import { z } from 'zod';

export const list[NomeFornecidoPlural]DtoQuerySchema = z.object({
  // Filtros específicos (opcionais)
  status: z.nativeEnum(StatusEnum).optional(),
  type: z.nativeEnum(TypeEnum).optional(),
  
  // Paginação (obrigatórios) - USAR TRANSFORM, NÃO COERCE
  page: z.coerce.number().int().min(1).optional(), // Default: 1
  offset: z.coerce.number().int().min(1).optional(), // Default: UTILITIES_PAGINATION_LIMIT

  // Exemplo de filtro booleano opcional
  ativo: z
    .union([
      z.string().transform((value) => value === 'true' || value === '1'),
      z.boolean(),
    ])
    .optional(),
});

export const list[NomeFornecidoPlural]DtoServiceSchema = list[NomeFornecidoPlural]DtoQuerySchema.extend({
  // Campos contextuais adicionados pelo controller
  professionalId: z.string().uuid(),
  professionalType: z.nativeEnum(ProfessionalTypeEnum),
});

export type TList[NomeFornecidoPlural]DtoQuerySchema = z.infer<typeof list[NomeFornecidoPlural]DtoQuerySchema>;
export type TList[NomeFornecidoPlural]DtoServiceSchema = z.infer<typeof list[NomeFornecidoPlural]DtoServiceSchema>;
```

#### 5.2.1 Documentação Swagger - Paginação

```typescript
// Arquivo: @docs/list-[nome-fornecido-plural].doc.ts
import { ApiProperty } from '@nestjs/swagger';
import { IApiDocumentationOptions } from '@/@decorators/api-documentation.decorator';
import {
  SwaggerPaginationQueryDto,
  SwaggerPaginationResponseDto,
} from '@/@shared/docs/pagination.doc';
import { Swagger[NomeFornecido]ResponseDto } from './[nome-fornecido]-response.doc';

export class SwaggerList[NomeFornecidoPlural]QueryDto extends SwaggerPaginationQueryDto {
  @ApiProperty({
    description: 'Status para filtrar',
    enum: ['ACTIVE', 'INACTIVE'],
    example: 'ACTIVE',
    required: false,
  })
  status?: string;

  @ApiProperty({
    description: 'Tipo para filtrar',
    enum: ['TYPE1', 'TYPE2'],
    example: 'TYPE1',
    required: false,
  })
  type?: string;
}

export class SwaggerList[NomeFornecidoPlural]ResponseDto extends SwaggerPaginationResponseDto {
  @ApiProperty({
    description: 'Lista de [nome-fornecido-plural]',
    type: [Swagger[NomeFornecido]ResponseDto],
  })
  data: Swagger[NomeFornecido]ResponseDto[];
}

export const List[NomeFornecidoPlural]Documentation: IApiDocumentationOptions = {
  summary: 'Listar [nome-fornecido-plural]',
  description: 'Lista [nome-fornecido-plural] com paginação e filtros opcionais.',
  tags: ['[NomeFornecidoPlural]'],
  auth: true,
  responses: {
    success: {
      status: 200,
      description: 'Lista retornada com sucesso',
      type: SwaggerList[NomeFornecidoPlural]ResponseDto,
    },
    // ... outros responses
  },
};
```

**Requisitos obrigatórios para List DTOs:**

1. **Query Schema**: Deve incluir `page?: number` e `offset?: number` como opcionais
2. **Service Schema**: Deve estender Query Schema com campos contextuais
3. **Filtros**: Usar `z.nativeEnum()` para validar enums de filtros
4. **Transformação**: Usar `z.union()` + `transform` ao invés de `z.coerce` para conversões explícitas
5. **Documentação**: Usar classes base de `@/@shared/docs/pagination.doc`

#### 5.3 Get DTO

```typescript
// Arquivo: dto/get-[nome-fornecido].dto.ts
import { z } from 'zod';

export const get[NomeFornecido]DtoParamSchema = z.object({
  id: z.string().uuid(),
});

export const get[NomeFornecido]DtoServiceSchema = get[NomeFornecido]DtoParamSchema.extend({
  professionalId: z.string().uuid(),
  professionalType: z.nativeEnum(ProfessionalTypeEnum),
});

export type TGet[NomeFornecido]DtoParamSchema = z.infer<typeof get[NomeFornecido]DtoParamSchema>;
export type TGet[NomeFornecido]DtoServiceSchema = z.infer<typeof get[NomeFornecido]DtoServiceSchema>;
```

#### 5.4 Update DTO

```typescript
// Arquivo: dto/update-[nome-fornecido].dto.ts
import { z } from 'zod';

export const update[NomeFornecido]DtoParamSchema = z.object({
  id: z.string().uuid(),
});

export const update[NomeFornecido]DtoBodySchema = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().optional(),
});

export const update[NomeFornecido]DtoServiceSchema = update[NomeFornecido]DtoParamSchema
  .merge(update[NomeFornecido]DtoBodySchema)
  .extend({
    professionalId: z.string().uuid(),
    professionalType: z.nativeEnum(ProfessionalTypeEnum),
  });

export type TUpdate[NomeFornecido]DtoParamSchema = z.infer<typeof update[NomeFornecido]DtoParamSchema>;
export type TUpdate[NomeFornecido]DtoBodySchema = z.infer<typeof update[NomeFornecido]DtoBodySchema>;
export type TUpdate[NomeFornecido]DtoServiceSchema = z.infer<typeof update[NomeFornecido]DtoServiceSchema>;
```

#### 5.5 Delete DTO

```typescript
// Arquivo: dto/delete-[nome-fornecido].dto.ts
import { z } from 'zod';

export const delete[NomeFornecido]DtoParamSchema = z.object({
  id: z.string().uuid(),
});

export const delete[NomeFornecido]DtoServiceSchema = delete[NomeFornecido]DtoParamSchema.extend({
  professionalId: z.string().uuid(),
  professionalType: z.nativeEnum(ProfessionalTypeEnum),
});

export type TDelete[NomeFornecido]DtoParamSchema = z.infer<typeof delete[NomeFornecido]DtoParamSchema>;
export type TDelete[NomeFornecido]DtoServiceSchema = z.infer<typeof delete[NomeFornecido]DtoServiceSchema>;
```

### 6. Controllers

#### 6.1 Create Controller

```typescript
// Arquivo: controllers/create-[nome-fornecido].controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ZodValidationPipe } from '@/@shared/pipes/zod-validation.pipe';
import { TCurrentUser } from '@/modules/authenticate/guard/jwt-authenticate.guard';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { CheckPolicies } from '@/modules/authorization/decorators/check-policies.decorator';
import { User } from '@/@decorators/current-user.decorator';
import { ReqContext } from '@/@decorators/request-context.decorator';
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';
import { ApiDocumentation } from '@/@decorators/api-documentation.decorator';
import { Create[NomeFornecido]Policy } from '../policies/create-[nome-fornecido].policy';
import { TCreate[NomeFornecido]Service } from '../services/create-[nome-fornecido].service';
import {
  create[NomeFornecido]DtoBodySchema,
  TCreate[NomeFornecido]DtoBodySchema,
} from '../dto/create-[nome-fornecido].dto';
import { Create[NomeFornecido]Documentation } from '../@docs/create-[nome-fornecido].doc';

@Controller('[nome-fornecido-plural]')
export class Create[NomeFornecido]Controller {
  constructor(private create[NomeFornecido]Service: TCreate[NomeFornecido]Service) {}

  @Post()
  @ApiDocumentation(Create[NomeFornecido]Documentation)
  @CheckPolicies(new Create[NomeFornecido]Policy())
  async create[NomeFornecido](
    @User() user: TCurrentUser,
    @ReqContext() context: IRequestContext,
    @Body(new ZodValidationPipe(create[NomeFornecido]DtoBodySchema))
    create[NomeFornecido]Dto: TCreate[NomeFornecido]DtoBodySchema,
  ) {
    const result = await this.create[NomeFornecido]Service.execute({
      ...create[NomeFornecido]Dto,
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

#### 6.2 List Controller - OBRIGATÓRIO: Paginação
```typescript
// Arquivo: controllers/list-[nome-fornecido-plural].controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ZodValidationPipe } from '@/@shared/pipes/zod-validation.pipe';
import { TCurrentUser } from '@/modules/authenticate/guard/jwt-authenticate.guard';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { CheckPolicies } from '@/modules/authorization/decorators/check-policies.decorator';
import { User } from '@/@decorators/current-user.decorator';
import { ReqContext } from '@/@decorators/request-context.decorator';
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';
import { ApiDocumentation } from '@/@decorators/api-documentation.decorator';
import { List[NomeFornecidoPlural]Policy } from '../policies/list-[nome-fornecido-plural].policy';
import { I[NomeFornecido]Repository } from '../repositories/[nome-fornecido].repository';
import { I[NomeFornecido]Presenter } from '../presenters/[nome-fornecido].presenter';
import {
  list[NomeFornecidoPlural]DtoQuerySchema,
  TList[NomeFornecidoPlural]DtoQuerySchema,
} from '../dto/list-[nome-fornecido-plural].dto';
import { List[NomeFornecidoPlural]Documentation } from '../@docs/list-[nome-fornecido-plural].doc';

@Controller('[nome-fornecido-plural]')
export class List[NomeFornecidoPlural]Controller {
  constructor(
    private [nomeFornecido]Repository: I[NomeFornecido]Repository,
    private [nomeFornecido]Presenter: I[NomeFornecido]Presenter,
  ) {}

  @Get()
  @ApiDocumentation(List[NomeFornecidoPlural]Documentation)
  @CheckPolicies(new List[NomeFornecidoPlural]Policy())
  async list[NomeFornecidoPlural](
    @User() user: TCurrentUser,
    @ReqContext() context: IRequestContext,
    @Query(new ZodValidationPipe(list[NomeFornecidoPlural]DtoQuerySchema))
    list[NomeFornecidoPlural]Dto: TList[NomeFornecidoPlural]DtoQuerySchema,
  ) {
    const result = await this.[nomeFornecido]Repository.findMany({
      // Adicionar filtros baseados no contexto do usuário
      where: {
        // professionalId: user.id, // ou outros filtros relevantes
      },
      // Adicionar paginação
      skip: list[NomeFornecidoPlural]Dto.offset || 0,
      take: list[NomeFornecidoPlural]Dto.limit || 10,
    });

    return {
      data: this.[nomeFornecido]Presenter.presentMany(result.data),
      total: result.total,
      hasNextPage: result.hasNextPage,
    };
  }
}
```

**NOTA**: Para operações de leitura com paginação, use presenters diretamente nos controllers. A paginação deve ser implementada no repository level.

#### 6.3 Get Controller
```typescript
// Arquivo: controllers/get-[nome-fornecido].controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { ZodValidationPipe } from '@/@shared/pipes/zod-validation.pipe';
import { TCurrentUser } from '@/modules/authenticate/guard/jwt-authenticate.guard';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { CheckPolicies } from '@/modules/authorization/decorators/check-policies.decorator';
import { User } from '@/@decorators/current-user.decorator';
import { ReqContext } from '@/@decorators/request-context.decorator';
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';
import { ApiDocumentation } from '@/@decorators/api-documentation.decorator';
import { Get[NomeFornecido]Policy } from '../policies/get-[nome-fornecido].policy';
import { I[NomeFornecido]Repository } from '../repositories/[nome-fornecido].repository';
import { I[NomeFornecido]Presenter } from '../presenters/[nome-fornecido].presenter';
import {
  get[NomeFornecido]DtoParamSchema,
  TGet[NomeFornecido]DtoParamSchema,
} from '../dto/get-[nome-fornecido].dto';
import { Get[NomeFornecido]Documentation } from '../@docs/get-[nome-fornecido].doc';
import { [NomeFornecido]NotFoundException } from '../errors/[nome-fornecido]-not-found.exception';

@Controller('[nome-fornecido-plural]/:id')
export class Get[NomeFornecido]Controller {
  constructor(
    private [nomeFornecido]Repository: I[NomeFornecido]Repository,
    private [nomeFornecido]Presenter: I[NomeFornecido]Presenter,
  ) {}

  @Get()
  @ApiDocumentation(Get[NomeFornecido]Documentation)
  @CheckPolicies(new Get[NomeFornecido]Policy())
  async get[NomeFornecido](
    @User() user: TCurrentUser,
    @ReqContext() context: IRequestContext,
    @Param(new ZodValidationPipe(get[NomeFornecido]DtoParamSchema))
    params: TGet[NomeFornecido]DtoParamSchema,
  ) {
    const [nomeFornecido] = await this.[nomeFornecido]Repository.findById(params.id);

    if (![nomeFornecido]) {
      throw new [NomeFornecido]NotFoundException(params.id, context);
    }

    return this.[nomeFornecido]Presenter.present([nomeFornecido]);
  }
}
```

**NOTA**: Para operações de leitura simples, use presenters diretamente nos controllers ao invés de services. Services devem ser reservados para operações de escrita ou lógica de negócio complexa.

#### 6.4 Update Controller
```typescript
// Arquivo: controllers/update-[nome-fornecido].controller.ts
import { Controller, Put, Param, Body } from '@nestjs/common';
import { ZodValidationPipe } from '@/@shared/pipes/zod-validation.pipe';
import { TCurrentUser } from '@/modules/authenticate/guard/jwt-authenticate.guard';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { CheckPolicies } from '@/modules/authorization/decorators/check-policies.decorator';
import { User } from '@/@decorators/current-user.decorator';
import { ReqContext } from '@/@decorators/request-context.decorator';
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';
import { ApiDocumentation } from '@/@decorators/api-documentation.decorator';
import { Update[NomeFornecido]Policy } from '../policies/update-[nome-fornecido].policy';
import { TUpdate[NomeFornecido]Service } from '../services/update-[nome-fornecido].service';
import {
  update[NomeFornecido]DtoParamSchema,
  update[NomeFornecido]DtoBodySchema,
  TUpdate[NomeFornecido]DtoParamSchema,
  TUpdate[NomeFornecido]DtoBodySchema,
} from '../dto/update-[nome-fornecido].dto';
import { Update[NomeFornecido]Documentation } from '../@docs/update-[nome-fornecido].doc';

@Controller('[nome-fornecido-plural]/:id')
export class Update[NomeFornecido]Controller {
  constructor(private update[NomeFornecido]Service: TUpdate[NomeFornecido]Service) {}

  @Put()
  @ApiDocumentation(Update[NomeFornecido]Documentation)
  @CheckPolicies(new Update[NomeFornecido]Policy())
  async update[NomeFornecido](
    @User() user: TCurrentUser,
    @ReqContext() context: IRequestContext,
    @Param(new ZodValidationPipe(update[NomeFornecido]DtoParamSchema))
    params: TUpdate[NomeFornecido]DtoParamSchema,
    @Body(new ZodValidationPipe(update[NomeFornecido]DtoBodySchema))
    update[NomeFornecido]Dto: TUpdate[NomeFornecido]DtoBodySchema,
  ) {
    const result = await this.update[NomeFornecido]Service.execute({
      ...params,
      ...update[NomeFornecido]Dto,
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

#### 6.5 Delete Controller
```typescript
// Arquivo: controllers/delete-[nome-fornecido].controller.ts
import { Controller, Delete, Param } from '@nestjs/common';
import { ZodValidationPipe } from '@/@shared/pipes/zod-validation.pipe';
import { TCurrentUser } from '@/modules/authenticate/guard/jwt-authenticate.guard';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { CheckPolicies } from '@/modules/authorization/decorators/check-policies.decorator';
import { User } from '@/@decorators/current-user.decorator';
import { ReqContext } from '@/@decorators/request-context.decorator';
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';
import { ApiDocumentation } from '@/@decorators/api-documentation.decorator';
import { Delete[NomeFornecido]Policy } from '../policies/delete-[nome-fornecido].policy';
import { TDelete[NomeFornecido]Service } from '../services/delete-[nome-fornecido].service';
import {
  delete[NomeFornecido]DtoParamSchema,
  TDelete[NomeFornecido]DtoParamSchema,
} from '../dto/delete-[nome-fornecido].dto';
import { Delete[NomeFornecido]Documentation } from '../@docs/delete-[nome-fornecido].doc';

@Controller('[nome-fornecido-plural]/:id')
export class Delete[NomeFornecido]Controller {
  constructor(private delete[NomeFornecido]Service: TDelete[NomeFornecido]Service) {}

  @Delete()
  @ApiDocumentation(Delete[NomeFornecido]Documentation)
  @CheckPolicies(new Delete[NomeFornecido]Policy())
  async delete[NomeFornecido](
    @User() user: TCurrentUser,
    @ReqContext() context: IRequestContext,
    @Param(new ZodValidationPipe(delete[NomeFornecido]DtoParamSchema))
    params: TDelete[NomeFornecido]DtoParamSchema,
  ) {
    const result = await this.delete[NomeFornecido]Service.execute({
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

### 7. Presenter

#### 7.1 Interface e Implementação
```typescript
// Arquivo: presenters/[nome-fornecido].presenter.ts
import { Injectable } from '@nestjs/common';
import { AbstractPresenter } from '@/@shared/classes/presenter';
import { I[NomeFornecido]Model } from '../models/[nome-fornecido].struct';

export type T[NomeFornecido]BasicPresenterResponse = Omit<
  I[NomeFornecido]Model,
  'createdAt' | 'updatedAt' | 'deletedAt'
>;

export type T[NomeFornecido]PresenterResponse = T[NomeFornecido]BasicPresenterResponse & {
  // Adicionar relacionamentos se necessário
};

export abstract class I[NomeFornecido]Presenter extends AbstractPresenter<
  I[NomeFornecido]Model,
  T[NomeFornecido]PresenterResponse
> {
  abstract presentWithoutRelations(
    [nomeFornecido]: I[NomeFornecido]Model,
  ): Omit<T[NomeFornecido]PresenterResponse, 'relatedEntity'>;
}

@Injectable()
export class [NomeFornecido]Presenter implements I[NomeFornecido]Presenter {
  constructor(
    // Injetar outros presenters se necessário para relacionamentos
  ) {}

  present([nomeFornecido]: I[NomeFornecido]Model): T[NomeFornecido]PresenterResponse {
    return {
      id: [nomeFornecido].id,
      nome: [nomeFornecido].nome,
      descricao: [nomeFornecido].descricao,
      
      // Relacionamentos condicionais
      // relatedEntity: [nomeFornecido].relatedEntity
      //   ? this.relatedPresenter.present([nomeFornecido].relatedEntity)
      //   : undefined,
    };
  }

  presentWithoutRelations(
    [nomeFornecido]: I[NomeFornecido]Model,
  ): Omit<T[NomeFornecido]PresenterResponse, 'relatedEntity'> {
    return {
      id: [nomeFornecido].id,
      nome: [nomeFornecido].nome,
      descricao: [nomeFornecido].descricao,
    };
  }

  presentMany([nomeFornecidoPlural]: I[NomeFornecido]Model[]): T[NomeFornecido]PresenterResponse[] {
    return [nomeFornecidoPlural].map(([nomeFornecido]) => this.present([nomeFornecido]));
  }
}
```

### 8. Documentação Swagger

#### 8.1 Create Documentation
```typescript
// Arquivo: @docs/create-[nome-fornecido].doc.ts
import { ApiDocumentationOptions } from '@/@decorators/api-documentation.decorator';

export const Create[NomeFornecido]Documentation: ApiDocumentationOptions = {
  summary: 'Criar um novo [nome-fornecido]',
  description: 'Endpoint para criar um novo [nome-fornecido] no sistema',
  tags: ['[nome-fornecido-plural]'],
  responses: {
    201: {
      description: '[NomeFornecido] criado com sucesso',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          nome: { type: 'string' },
          descricao: { type: 'string', nullable: true },
        },
      },
    },
    400: {
      description: 'Dados inválidos',
    },
    401: {
      description: 'Não autorizado',
    },
    403: {
      description: 'Sem permissão para executar esta ação',
    },
  },
};
```

#### 8.2 List Documentation
```typescript
// Arquivo: @docs/list-[nome-fornecido-plural].doc.ts
import { ApiDocumentationOptions } from '@/@decorators/api-documentation.decorator';

export const List[NomeFornecidoPlural]Documentation: ApiDocumentationOptions = {
  summary: 'Listar [nome-fornecido-plural]',
  description: 'Endpoint para listar [nome-fornecido-plural] com filtros opcionais',
  tags: ['[nome-fornecido-plural]'],
  responses: {
    200: {
      description: 'Lista de [nome-fornecido-plural] retornada com sucesso',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nome: { type: 'string' },
            descricao: { type: 'string', nullable: true },
          },
        },
      },
    },
    401: {
      description: 'Não autorizado',
    },
    403: {
      description: 'Sem permissão para executar esta ação',
    },
  },
};
```

### 9. Políticas de Autorização


#### 9.1 Políticas com CASL Ability
```typescript
// Arquivo: policies/create-[nome-fornecido].policy.ts
import { TAppAbility } from '@/modules/authorization/casl-ability.factory';
import { IPolicyHandler } from '@/modules/authorization/models/polict.struct';

export class Create[NomeFornecido]Policy implements IPolicyHandler {
  handle(ability: TAppAbility): boolean {
    return ability.can('write', '[nome-fornecido-plural]');
  }
}
```

**Regras obrigatórias para policies:**
- Sempre use o plural do recurso (ex: 'agendas') como subject.
- Para criação e atualização, use a action 'write'.
- Para leitura, use 'read'.
- Para deleção, use 'delete'.
- Use sempre o padrão: `ability.can(action, subject)`


### 10. Exceptions Personalizadas

#### 10.1 Padrão Geral de Exceptions

**Todas as exceptions customizadas devem seguir as instruções detalhadas em `exception.instructions.md`.**

- As exceptions devem estender `AbstractApplicationException` (e não diretamente classes do NestJS).
- O nome da classe deve seguir o padrão `[NomeFornecido]NotFoundException`, `[NomeFornecido]AlreadyExistsException`, etc.
- O arquivo deve estar em `errors/[nome-fornecido]-not-found.exception.ts`.
- Use sempre o `HttpStatus` apropriado do NestJS.
- Mensagens devem ser claras, descritivas e em inglês, incluindo identificadores relevantes.
- O construtor deve aceitar parâmetros relevantes (ex: id, email, context, etc).
- Para erros de enum, utilize a `InvalidEnumCaseException` do projeto.

**Exemplo de NotFoundException:**
```typescript
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { HttpStatus } from '@nestjs/common';

export class [NomeFornecido]NotFoundException extends AbstractApplicationException {
  constructor(id: string, context?: IRequestContext) {
    super(
      `[NomeFornecido] not found with id: ${id}`,
      '[NomeFornecido]NotFoundException',
      HttpStatus.NOT_FOUND,
      context,
    );
  }
}
```

**Para detalhes completos, consulte o arquivo `exception.instructions.md`.**

### 11. Module (Aplicar instruções do module.instructions.md)

```typescript
// Arquivo: [nome-fornecido-plural].module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { [NomeFornecido]Entity } from './entities/[nome-fornecido].entity';
import {
  I[NomeFornecidoPlural]Repository,
  [NomeFornecidoPlural]Repository,
} from './repositories/[nome-fornecido-plural].repository';
import {
  I[NomeFornecido]Presenter,
  [NomeFornecido]Presenter,
} from './presenters/[nome-fornecido].presenter';

// Services
import {
  TCreate[NomeFornecido]Service,
  Create[NomeFornecido]Service,
} from './services/create-[nome-fornecido].service';
import {
  TList[NomeFornecidoPlural]Service,
  List[NomeFornecidoPlural]Service,
} from './services/list-[nome-fornecido-plural].service';
import {
  TGet[NomeFornecido]Service,
  Get[NomeFornecido]Service,
} from './services/get-[nome-fornecido].service';
import {
  TUpdate[NomeFornecido]Service,
  Update[NomeFornecido]Service,
} from './services/update-[nome-fornecido].service';
import {
  TDelete[NomeFornecido]Service,
  Delete[NomeFornecido]Service,
} from './services/delete-[nome-fornecido].service';

// Controllers
import { Create[NomeFornecido]Controller } from './controllers/create-[nome-fornecido].controller';
import { List[NomeFornecidoPlural]Controller } from './controllers/list-[nome-fornecido-plural].controller';
import { Get[NomeFornecido]Controller } from './controllers/get-[nome-fornecido].controller';
import { Update[NomeFornecido]Controller } from './controllers/update-[nome-fornecido].controller';
import { Delete[NomeFornecido]Controller } from './controllers/delete-[nome-fornecido].controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      [NomeFornecido]Entity,
    ]),
    // Outros módulos necessários
  ],
  controllers: [
    /// //////////////////////////
    //  [Nome do módulo]
    /// //////////////////////////
    Create[NomeFornecido]Controller,
    List[NomeFornecidoPlural]Controller,
    Get[NomeFornecido]Controller,
    Update[NomeFornecido]Controller,
    Delete[NomeFornecido]Controller,
  ],
  providers: [
    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    {
      provide: I[NomeFornecidoPlural]Repository,
      useClass: [NomeFornecidoPlural]Repository,
    },

    /// //////////////////////////
    //  Services
    /// //////////////////////////
    {
      provide: TCreate[NomeFornecido]Service,
      useClass: Create[NomeFornecido]Service,
    },
    {
      provide: TList[NomeFornecidoPlural]Service,
      useClass: List[NomeFornecidoPlural]Service,
    },
    {
      provide: TGet[NomeFornecido]Service,
      useClass: Get[NomeFornecido]Service,
    },
    {
      provide: TUpdate[NomeFornecido]Service,
      useClass: Update[NomeFornecido]Service,
    },
    {
      provide: TDelete[NomeFornecido]Service,
      useClass: Delete[NomeFornecido]Service,
    },

    /// //////////////////////////
    //  Presenters
    /// //////////////////////////
    {
      provide: I[NomeFornecido]Presenter,
      useClass: [NomeFornecido]Presenter,
    },
  ],
  exports: [
    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    I[NomeFornecidoPlural]Repository,

    /// //////////////////////////
    //  Services
    /// //////////////////////////
    TCreate[NomeFornecido]Service,
    // Exportar apenas os services necessários para outros módulos

    /// //////////////////////////
    //  Presenters
    /// //////////////////////////
    I[NomeFornecido]Presenter,
    // Exportar apenas os presenters necessários para outros módulos
  ],
})
export class [NomeFornecidoPlural]Module {}
```

### 12. Checklist de Criação

#### 12.1 Estrutura de Pastas
- [ ] `models/[nome-fornecido].struct.ts`
- [ ] `entities/[nome-fornecido].entity.ts`
- [ ] `repositories/[nome-fornecido-plural].repository.ts`
- [ ] `services/create-[nome-fornecido].service.ts`
- [ ] `services/list-[nome-fornecido-plural].service.ts`
- [ ] `services/get-[nome-fornecido].service.ts`
- [ ] `services/update-[nome-fornecido].service.ts`
- [ ] `services/delete-[nome-fornecido].service.ts`
- [ ] `controllers/create-[nome-fornecido].controller.ts`
- [ ] `controllers/list-[nome-fornecido-plural].controller.ts`
- [ ] `controllers/get-[nome-fornecido].controller.ts`
- [ ] `controllers/update-[nome-fornecido].controller.ts`
- [ ] `controllers/delete-[nome-fornecido].controller.ts`
- [ ] `presenters/[nome-fornecido].presenter.ts`
- [ ] `dto/create-[nome-fornecido].dto.ts`
- [ ] `dto/list-[nome-fornecido-plural].dto.ts`
- [ ] `dto/get-[nome-fornecido].dto.ts`
- [ ] `dto/update-[nome-fornecido].dto.ts`
- [ ] `dto/delete-[nome-fornecido].dto.ts`
- [ ] `@docs/create-[nome-fornecido].doc.ts`
- [ ] `@docs/list-[nome-fornecido-plural].doc.ts`
- [ ] `@docs/get-[nome-fornecido].doc.ts`
- [ ] `@docs/update-[nome-fornecido].doc.ts`
- [ ] `@docs/delete-[nome-fornecido].doc.ts`
- [ ] `policies/create-[nome-fornecido].policy.ts`
- [ ] `policies/list-[nome-fornecido-plural].policy.ts`
- [ ] `policies/get-[nome-fornecido].policy.ts`
- [ ] `policies/update-[nome-fornecido].policy.ts`
- [ ] `policies/delete-[nome-fornecido].policy.ts`
- [ ] `errors/[nome-fornecido]-not-found.exception.ts`
- [ ] `[nome-fornecido-plural].module.ts`

#### 12.2 Configurações
- [ ] Implementar Model com interface I[NomeFornecido]Model
- [ ] Criar Entity implementando o Model
- [ ] Criar Repository estendendo AbstractRepository
- [ ] Criar Services estendendo AbstractService
- [ ] Criar Controllers com decorators de autenticação e autorização
- [ ] Criar Presenters estendendo AbstractPresenter
- [ ] Criar DTOs com validação Zod
- [ ] Criar documentação Swagger personalizada
- [ ] Implementar políticas de autorização
- [ ] Registrar entidade no TypeORM
- [ ] Configurar providers no módulo
- [ ] Configurar controllers no módulo
- [ ] Configurar exports necessários

#### 12.3 Validações
- [ ] Validação de DTOs com Zod
- [ ] Validação de entidades existentes nos services
- [ ] Validação de permissões nas políticas
- [ ] Validação de relacionamentos se aplicável
- [ ] Tratamento de erros customizados

#### 12.4 Testes
- [ ] Testes unitários para services
- [ ] Testes unitários para repositories
- [ ] Testes de integração para controllers
- [ ] Testes de apresentação para presenters
- [ ] Testes de políticas de autorização

### 13. Exemplo de Substituição de Placeholders

Para criar um módulo de "Produtos":
- `[NomeFornecido]` → `Produto`
- `[nome-fornecido]` → `produto`
- `[NomeFornecidoPlural]` → `Produtos`
- `[nome-fornecido-plural]` → `produtos`
- `[nomeFornecido]` → `produto` (variável)
- `[nomeFornecidoPlural]` → `produtos` (variável)

### 14. Migrations

#### 14.1 Criar Migration Manualmente
```bash
pnpm run migration:create Criando[NomeFornecido]Entity
```

#### 14.2 Estrutura da Migration
```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Criando[NomeFornecido]Entity1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: '[nome-fornecido-plural]',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'nome',
            type: 'varchar',
          },
          {
            name: 'descricao',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('[nome-fornecido-plural]');
  }
}
```

#### 14.3 Executar Migration
```bash
pnpm run migration:run
```

### 15. Convenções de Nomenclatura

#### 15.1 Arquivos
- **Model**: `[nome-fornecido].struct.ts`
- **Entity**: `[nome-fornecido].entity.ts`
- **Repository**: `[nome-fornecido-plural].repository.ts`
- **Service**: `[acao]-[nome-fornecido].service.ts`
- **Controller**: `[acao]-[nome-fornecido].controller.ts`
- **Presenter**: `[nome-fornecido].presenter.ts`
- **DTO**: `[acao]-[nome-fornecido].dto.ts`
- **Documentation**: `[acao]-[nome-fornecido].doc.ts`
- **Policy**: `[acao]-[nome-fornecido].policy.ts`
- **Exception**: `[nome-fornecido]-[tipo].exception.ts`
- **Module**: `[nome-fornecido-plural].module.ts`

#### 15.2 Classes e Interfaces
- **Model Interface**: `I[NomeFornecido]Model`
- **Entity Class**: `[NomeFornecido]Entity`
- **Repository Interface**: `I[NomeFornecidoPlural]Repository`
- **Repository Class**: `[NomeFornecidoPlural]Repository`
- **Service Abstract**: `T[Acao][NomeFornecido]Service`
- **Service Class**: `[Acao][NomeFornecido]Service`
- **Controller Class**: `[Acao][NomeFornecido]Controller`
- **Presenter Interface**: `I[NomeFornecido]Presenter`
- **Presenter Class**: `[NomeFornecido]Presenter`
- **DTO Type**: `T[Acao][NomeFornecido]Dto[Tipo]Schema`
- **Policy Class**: `[Acao][NomeFornecido]Policy`
- **Exception Class**: `[NomeFornecido][Tipo]Exception`
- **Module Class**: `[NomeFornecidoPlural]Module`

### 16. Padrões de Código

#### 16.1 Imports
- Sempre usar imports absolutos com `@/`
- Agrupar imports por categoria (NestJS, bibliotecas, projeto)
- Manter ordem alfabética dentro de cada grupo

#### 16.2 Injeção de Dependências
- Usar sempre as interfaces/abstrações nos construtores
- Agrupar dependências por tipo (repositories, services, presenters)
- Adicionar comentários visuais para separar grupos

#### 16.3 Tratamento de Erros
- Sempre usar `Result<T>` nos services
- Criar exceptions customizadas para cada tipo de erro
- Adicionar contexto da requisição nos erros

#### 16.4 Logs
- Usar `ILogger` com `CustomLogger` em todos os services e repositories
- Adicionar logs nos pontos importantes dos services
- Usar o nome da classe como identificador do logger
- Incluir dados relevantes nos logs (sem dados sensíveis)
- Logger customizado aplica separadores visuais automaticamente para objetos

#### 16.5 Validações
- Usar Zod para validação de DTOs
- Usar `z.union()` + `transform` ao invés de `z.coerce` para conversões explícitas
- Validar entidades existentes antes de operações
- Validar permissões nas políticas
- Validar relacionamentos quando aplicável

#### 16.6 Transformações Zod - OBRIGATÓRIO
- **String → Number**: `z.union([z.string().transform((value) => parseInt(value, 10)), z.number()]).pipe(z.number().int().min(1))`
- **String → Boolean**: `z.union([z.string().transform((value) => value === 'true' || value === '1'), z.boolean()])`
- **String → Date**: `z.union([z.string().transform((value) => new Date(value)), z.date()]).pipe(z.date())`

#### 16.7 Paginação - OBRIGATÓRIO para APIs de Lista
- Usar `IPagination<T>` como tipo de retorno em todos os services de listagem
- Incluir `page?: number` e `offset?: number` nos DTOs de Query
- Definir defaults nos services: `page = 1` e `offset = this.envService.get('UTILITIES_PAGINATION_LIMIT')`
- Injetar `EnvService` nos services de listagem
- Usar `enumFromStringValue` para validar filtros de enum
- Retornar `{ data, total, hasNextPage }` do repository
- Documentar response de paginação no Swagger

---

## Observações Importantes

1. **Sempre criar migrations manualmente** - Usar `pnpm run migration:create NomeMigration` (não usar geração automática)
2. **Seguir a estrutura de pastas** - Manter organização consistente
3. **Usar os padrões estabelecidos** - AbstractService, AbstractRepository, AbstractPresenter
4. **Implementar todas as camadas** - Model, Entity, Repository, Service, Controller, Presenter
5. **Documentar adequadamente** - Swagger, comentários, README
6. **Testar completamente** - Unitários, integração, e2e
7. **Seguir convenções de nomenclatura** - Consistência em todo o projeto
8. **Implementar paginação obrigatória** - Usar IPagination<T> em todas as APIs de lista
9. **Usar transformações explícitas** - Sempre usar `z.union()` + `transform` ao invés de `z.coerce` para conversões

---
Siga este padrão sempre que for criar um novo Módulo completo.
