# Swagger Documentation

## 8. Swagger Documentation

### 8.1 Create Documentation

```typescript
// File: @docs/create-[entity-name].doc.ts
import { ApiDocumentationOptions } from '@/@decorators/api-documentation.decorator';

export const Create[EntityName]Documentation: ApiDocumentationOptions = {
  summary: 'Create a new [entity-name]',
  description: 'Endpoint to create a new [entity-name] in the system',
  tags: ['[entity-name-plural]'],
  responses: {
    201: {
      description: '[EntityName] created successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
        },
      },
    },
    400: {
      description: 'Invalid data',
    },
    401: {
      description: 'Unauthorized',
    },
    403: {
      description: 'No permission to execute this action',
    },
  },
};
```

### 8.2 List Documentation

```typescript
// File: @docs/list-[entity-name-plural].doc.ts
import { ApiDocumentationOptions } from '@/@decorators/api-documentation.decorator';

export const List[EntityNamePlural]Documentation: ApiDocumentationOptions = {
  summary: 'List [entity-name-plural]',
  description: 'Endpoint to list [entity-name-plural] with optional filters',
  tags: ['[entity-name-plural]'],
  responses: {
    200: {
      description: 'List of [entity-name-plural] returned successfully',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
          },
        },
      },
    },
    401: {
      description: 'Unauthorized',
    },
    403: {
      description: 'No permission to execute this action',
    },
  },
};
```