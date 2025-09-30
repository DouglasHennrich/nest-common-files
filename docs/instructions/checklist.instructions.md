# Module Creation Checklist

## 12. Module Creation Checklist

### 12.1 Folder Structure
- [ ] `models/[entity-name].struct.ts`
- [ ] `entities/[entity-name].entity.ts`
- [ ] `repositories/[entity-name-plural].repository.ts`
- [ ] `services/create-[entity-name].service.ts`
- [ ] `services/list-[entity-name-plural].service.ts`
- [ ] `services/get-[entity-name].service.ts`
- [ ] `services/update-[entity-name].service.ts`
- [ ] `services/delete-[entity-name].service.ts`
- [ ] `controllers/create-[entity-name].controller.ts`
- [ ] `controllers/list-[entity-name-plural].controller.ts`
- [ ] `controllers/get-[entity-name].controller.ts`
- [ ] `controllers/update-[entity-name].controller.ts`
- [ ] `controllers/delete-[entity-name].controller.ts`
- [ ] `presenters/[entity-name].presenter.ts`
- [ ] `dto/create-[entity-name].dto.ts`
- [ ] `dto/list-[entity-name-plural].dto.ts`
- [ ] `dto/get-[entity-name].dto.ts`
- [ ] `dto/update-[entity-name].dto.ts`
- [ ] `dto/delete-[entity-name].dto.ts`
- [ ] `@docs/create-[entity-name].doc.ts`
- [ ] `@docs/list-[entity-name-plural].doc.ts`
- [ ] `@docs/get-[entity-name].doc.ts`
- [ ] `@docs/update-[entity-name].doc.ts`
- [ ] `@docs/delete-[entity-name].doc.ts`
- [ ] `policies/create-[entity-name].policy.ts`
- [ ] `policies/list-[entity-name-plural].policy.ts`
- [ ] `policies/get-[entity-name].policy.ts`
- [ ] `policies/update-[entity-name].policy.ts`
- [ ] `policies/delete-[entity-name].policy.ts`
- [ ] `errors/[entity-name]-not-found.exception.ts`
- [ ] `[entity-name-plural].module.ts`

### 12.2 Configurations
- [ ] Implement Model with interface `I[EntityName]Model`
- [ ] Create Entity implementing the Model
- [ ] Create Repository extending `AbstractRepository`
- [ ] Create Services extending `AbstractService`
- [ ] Create Controllers with authentication and authorization decorators
- [ ] Create Presenters extending `AbstractPresenter`
- [ ] Create DTOs with Zod validation
- [ ] Create custom Swagger documentation
- [ ] Implement authorization policies
- [ ] Register entity in TypeORM
- [ ] Configure providers in module
- [ ] Configure controllers in module
- [ ] Configure necessary exports

### 12.3 Validations
- [ ] DTO validation with Zod
- [ ] Validation of existing entities in services
- [ ] Permission validation in policies
- [ ] Relationship validation if applicable
- [ ] Custom error handling

### 12.4 Tests
- [ ] Unit tests for services
- [ ] Unit tests for repositories
- [ ] Integration tests for controllers
- [ ] Presentation tests for presenters
- [ ] Authorization policy tests

## 13. Placeholder Replacement Example

For creating a "Products" module:
- `[EntityName]` → `Product`
- `[entity-name]` → `product`
- `[EntityNamePlural]` → `Products`
- `[entity-name-plural]` → `products`
- `[entityName]` → `product` (variable)
- `[entityNamePlural]` → `products` (variable)