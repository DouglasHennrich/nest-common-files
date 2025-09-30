# Naming Conventions and Code Patterns

## 15. Naming Conventions

### 15.1 Files
- **Model**: `[entity-name].struct.ts`
- **Entity**: `[entity-name].entity.ts`
- **Repository**: `[entity-name-plural].repository.ts`
- **Service**: `[action]-[entity-name].service.ts`
- **Controller**: `[action]-[entity-name].controller.ts`
- **Presenter**: `[entity-name].presenter.ts`
- **DTO**: `[action]-[entity-name].dto.ts`
- **Documentation**: `[action]-[entity-name].doc.ts`
- **Policy**: `[action]-[entity-name].policy.ts`
- **Exception**: `[entity-name]-[type].exception.ts`
- **Module**: `[entity-name-plural].module.ts`

### 15.2 Classes and Interfaces
- **Model Interface**: `I[EntityName]Model`
- **Entity Class**: `[EntityName]Entity`
- **Repository Interface**: `I[EntityNamePlural]Repository`
- **Repository Class**: `[EntityNamePlural]Repository`
- **Service Abstract**: `T[Action][EntityName]Service`
- **Service Class**: `[Action][EntityName]Service`
- **Controller Class**: `[Action][EntityName]Controller`
- **Presenter Interface**: `I[EntityName]Presenter`
- **Presenter Class**: `[EntityName]Presenter`
- **DTO Type**: `T[Action][EntityName]Dto[Type]Schema`
- **Policy Class**: `[Action][EntityName]Policy`
- **Exception Class**: `[EntityName][Type]Exception`
- **Module Class**: `[EntityNamePlural]Module`

## 16. Code Patterns

### 16.1 Imports
- Always use absolute imports with `@/`
- Group imports by category (NestJS, libraries, project)
- Maintain alphabetical order within each group

### 16.2 Dependency Injection
- Always use interfaces/abstractions in constructors
- Group dependencies by type (repositories, services, presenters)
- Add visual comments to separate groups

### 16.3 Error Handling
- Always use `Result<T>` in services
- Create custom exceptions for each error type
- Add request context to errors

### 16.4 Logging
- Use `ILogger` with `CustomLogger` in all services and repositories
- Add logs at important service points
- Use class name as logger identifier
- Include relevant data in logs (without sensitive data)
- Custom logger automatically applies visual separators for objects

### 16.5 Validations
- Use Zod for DTO validation
- Use `z.union()` + `transform` instead of `z.coerce` for explicit conversions
- Validate existing entities before operations
- Validate permissions in policies
- Validate relationships when applicable

### 16.6 Zod Transformations - MANDATORY
- **String → Number**: `z.union([z.string().transform((value) => parseInt(value, 10)), z.number()]).pipe(z.number().int().min(1))`
- **String → Boolean**: `z.union([z.string().transform((value) => value === 'true' || value === '1'), z.boolean()])`
- **String → Date**: `z.union([z.string().transform((value) => new Date(value)), z.date()]).pipe(z.date())`

### 16.7 Pagination - MANDATORY for List APIs
- Use `IPagination<T>` as return type in all list services
- Include `page?: number` and `offset?: number` in Query DTOs
- Define defaults in services: `page = 1` and `offset = this.envService.get('UTILITIES_PAGINATION_LIMIT')`
- Inject `EnvService` in list services
- Use `enumFromStringValue` to validate enum filters
- Return `{ data, total, hasNextPage }` from repository
- Document pagination response in Swagger