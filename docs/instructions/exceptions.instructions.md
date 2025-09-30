# Custom Exceptions

## 10. Custom Exceptions

### 10.1 General Exception Pattern

**All custom exceptions must follow the detailed instructions in `exception.instructions.md`.**

- Custom exceptions must extend `AbstractApplicationException` (and not directly NestJS classes).
- Class name must follow the pattern `[EntityName]NotFoundException`, `[EntityName]AlreadyExistsException`, etc.
- File must be in `errors/[entity-name]-not-found.exception.ts`.
- Always use the appropriate `HttpStatus` from NestJS.
- Messages must be clear, descriptive, and in English, including relevant identifiers.
- Constructor must accept relevant parameters (ex: id, email, context, etc).
- For enum errors, use the `InvalidEnumCaseException` from the project.

**Example of NotFoundException:**
```typescript
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';
import { IRequestContext } from '@/@shared/protocols/request-context.struct';
import { HttpStatus } from '@nestjs/common';

export class [EntityName]NotFoundException extends AbstractApplicationException {
  constructor(id: string, context?: IRequestContext) {
    super(
      `[EntityName] not found with id: ${id}`,
      '[EntityName]NotFoundException',
      HttpStatus.NOT_FOUND,
      context,
    );
  }
}
```

**For complete details, consult the file `exception.instructions.md`.**