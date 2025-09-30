# Complete NestJS Module Creation Guide

## Overview

This guide provides comprehensive instructions for creating complete NestJS modules following the established architecture patterns. The complete flow covers all layers from Model to Module, ensuring consistency and maintainability across the application.

## Complete Flow: Model → Entity → Repository → Service → Controller → Presenter → Module

The module creation process follows a layered architecture:

1. **Model** (Interface) - Defines the data structure
2. **Entity** (TypeORM) - Database representation with relationships
3. **Repository** - Data access layer with CRUD operations
4. **Services** - Business logic layer (Create, List, Get, Update, Delete)
5. **Controllers** - HTTP request handlers with validation and authorization
6. **Presenter** - Data transformation layer for API responses
7. **DTOs** - Data Transfer Objects with Zod validation
8. **Documentation** - Swagger/OpenAPI documentation
9. **Policies** - Authorization rules with CASL
10. **Exceptions** - Custom error handling
11. **Module** - NestJS module configuration
12. **Migrations** - Database schema changes

## Key Principles

- **Layered Architecture**: Clear separation of concerns between layers
- **Dependency Injection**: Use interfaces and abstractions for testability
- **Validation**: Comprehensive input validation with Zod schemas
- **Authorization**: Policy-based access control with CASL
- **Error Handling**: Custom exceptions with proper HTTP status codes
- **Documentation**: Complete Swagger documentation for all endpoints
- **Testing**: Unit and integration tests for all components
- **Consistency**: Follow established naming conventions and patterns

## Important Notes

1. **Always create migrations manually** - Use `pnpm run migration:create MigrationName` (do not use automatic generation)
2. **Follow the folder structure** - Maintain consistent organization
3. **Use established patterns** - AbstractService, AbstractRepository, AbstractPresenter
4. **Implement all layers** - Model, Entity, Repository, Service, Controller, Presenter
5. **Document properly** - Swagger, comments, README
6. **Test thoroughly** - Unit, integration, and e2e tests
7. **Follow naming conventions** - Consistency across the project
8. **Implement mandatory pagination** - Use `IPagination<T>` for all list APIs
9. **Use explicit transformations** - Always use `z.union()` + `transform` instead of `z.coerce` for conversions

Follow this pattern whenever creating a new complete module.