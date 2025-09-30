# DTOs with Zod

## 5. DTOs with Zod

### 5.0 Zod Transformation Patterns

**MANDATORY**: Use `z.nativeEnum()` for enums:

##### 5.0.1 Enums
```typescript
// ❌ Avoid: z.enum(Object.values(MyEnum) as [string, ...string[]])
// ✅ Use:
z.nativeEnum(MyEnum)
z.nativeEnum(StatusEnum).optional()
```

##### 5.0.2 String → Number Conversion
```typescript
// ❌ Avoid: z.coerce.number()
// ✅ Use:
z.union([
  z.string().transform((value) => parseInt(value, 10)),
  z.number(),
]).pipe(z.number().int().min(1))
```

##### 5.0.3 String → Boolean Conversion
```typescript
// For values like 'true', '1', 'false', '0'
z.union([
  z.string().transform((value) => value === 'true' || value === '1'),
  z.boolean(),
])
```

##### 5.0.4 String → Date Conversion
```typescript
z.coerce.date()
```

### 5.1 Create DTO

```typescript
// File: dto/create-[entity-name].dto.ts
import { z } from 'zod';

export const create[EntityName]DtoBodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  // Example of optional numeric field
  age: z
    .union([
      z.string().transform((value) => parseInt(value, 10)),
      z.number(),
    ])
    .pipe(z.number().int().min(1))
    .optional(),
  // Example of optional boolean field
  active: z
    .union([
      z.string().transform((value) => value === 'true' || value === '1'),
      z.boolean(),
    ])
    .optional(),
});

export const create[EntityName]DtoServiceSchema = create[EntityName]DtoBodySchema.extend({
  professionalId: z.string().uuid(),
  professionalType: z.nativeEnum(ProfessionalTypeEnum),
});

export type TCreate[EntityName]DtoBodySchema = z.infer<typeof create[EntityName]DtoBodySchema>;
export type TCreate[EntityName]DtoServiceSchema = z.infer<typeof create[EntityName]DtoServiceSchema>;
```

### 5.2 List DTO - MANDATORY: Pagination

```typescript
// File: dto/list-[entity-name-plural].dto.ts
import { z } from 'zod';

export const list[EntityNamePlural]DtoQuerySchema = z.object({
  // Specific optional filters
  status: z.nativeEnum(StatusEnum).optional(),
  type: z.nativeEnum(TypeEnum).optional(),

  // Pagination (mandatory) - USE TRANSFORM, NOT COERCE
  page: z.coerce.number().int().min(1).optional(), // Default: 1
  offset: z.coerce.number().int().min(1).optional(), // Default: UTILITIES_PAGINATION_LIMIT

  // Example of optional boolean filter
  active: z
    .union([
      z.string().transform((value) => value === 'true' || value === '1'),
      z.boolean(),
    ])
    .optional(),
});

export const list[EntityNamePlural]DtoServiceSchema = list[EntityNamePlural]DtoQuerySchema.extend({
  // Contextual fields added by controller
  professionalId: z.string().uuid(),
  professionalType: z.nativeEnum(ProfessionalTypeEnum),
});

export type TList[EntityNamePlural]DtoQuerySchema = z.infer<typeof list[EntityNamePlural]DtoQuerySchema>;
export type TList[EntityNamePlural]DtoServiceSchema = z.infer<typeof list[EntityNamePlural]DtoServiceSchema>;
```

#### 5.2.1 Swagger Documentation - Pagination

```typescript
// File: @docs/list-[entity-name-plural].doc.ts
import { ApiProperty } from '@nestjs/swagger';
import { IApiDocumentationOptions } from '@/@decorators/api-documentation.decorator';
import {
  SwaggerPaginationQueryDto,
  SwaggerPaginationResponseDto,
} from '@/@shared/docs/pagination.doc';
import { Swagger[EntityName]ResponseDto } from './[entity-name]-response.doc';

export class SwaggerList[EntityNamePlural]QueryDto extends SwaggerPaginationQueryDto {
  @ApiProperty({
    description: 'Status to filter by',
    enum: ['ACTIVE', 'INACTIVE'],
    example: 'ACTIVE',
    required: false,
  })
  status?: string;

  @ApiProperty({
    description: 'Type to filter by',
    enum: ['TYPE1', 'TYPE2'],
    example: 'TYPE1',
    required: false,
  })
  type?: string;
}

export class SwaggerList[EntityNamePlural]ResponseDto extends SwaggerPaginationResponseDto {
  @ApiProperty({
    description: 'List of [entity-name-plural]',
    type: [Swagger[EntityName]ResponseDto],
  })
  data: Swagger[EntityName]ResponseDto[];
}

export const List[EntityNamePlural]Documentation: IApiDocumentationOptions = {
  summary: 'List [entity-name-plural]',
  description: 'List [entity-name-plural] with pagination and optional filters.',
  tags: ['[EntityNamePlural]'],
  auth: true,
  responses: {
    success: {
      status: 200,
      description: 'List returned successfully',
      type: SwaggerList[EntityNamePlural]ResponseDto,
    },
    // ... other responses
  },
};
```

**Mandatory requirements for List DTOs:**

1. **Query Schema**: Must include `page?: number` and `offset?: number` as optional
2. **Service Schema**: Must extend Query Schema with contextual fields
3. **Filters**: Use `z.nativeEnum()` for validating enum filters
4. **Transformation**: Use `z.union()` + `transform` instead of `z.coerce` for explicit conversions
5. **Documentation**: Use base classes from `@/@shared/docs/pagination.doc`

### 5.3 Get DTO

```typescript
// File: dto/get-[entity-name].dto.ts
import { z } from 'zod';

export const get[EntityName]DtoParamSchema = z.object({
  id: z.string().uuid(),
});

export const get[EntityName]DtoServiceSchema = get[EntityName]DtoParamSchema.extend({
  professionalId: z.string().uuid(),
  professionalType: z.nativeEnum(ProfessionalTypeEnum),
});

export type TGet[EntityName]DtoParamSchema = z.infer<typeof get[EntityName]DtoParamSchema>;
export type TGet[EntityName]DtoServiceSchema = z.infer<typeof get[EntityName]DtoServiceSchema>;
```

### 5.4 Update DTO

```typescript
// File: dto/update-[entity-name].dto.ts
import { z } from 'zod';

export const update[EntityName]DtoParamSchema = z.object({
  id: z.string().uuid(),
});

export const update[EntityName]DtoBodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const update[EntityName]DtoServiceSchema = update[EntityName]DtoParamSchema
  .merge(update[EntityName]DtoBodySchema)
  .extend({
    professionalId: z.string().uuid(),
    professionalType: z.nativeEnum(ProfessionalTypeEnum),
  });

export type TUpdate[EntityName]DtoParamSchema = z.infer<typeof update[EntityName]DtoParamSchema>;
export type TUpdate[EntityName]DtoBodySchema = z.infer<typeof update[EntityName]DtoBodySchema>;
export type TUpdate[EntityName]DtoServiceSchema = z.infer<typeof update[EntityName]DtoServiceSchema>;
```

### 5.5 Delete DTO

```typescript
// File: dto/delete-[entity-name].dto.ts
import { z } from 'zod';

export const delete[EntityName]DtoParamSchema = z.object({
  id: z.string().uuid(),
});

export const delete[EntityName]DtoServiceSchema = delete[EntityName]DtoParamSchema.extend({
  professionalId: z.string().uuid(),
  professionalType: z.nativeEnum(ProfessionalTypeEnum),
});

export type TDelete[EntityName]DtoParamSchema = z.infer<typeof delete[EntityName]DtoParamSchema>;
export type TDelete[EntityName]DtoServiceSchema = z.infer<typeof delete[EntityName]DtoServiceSchema>;
```