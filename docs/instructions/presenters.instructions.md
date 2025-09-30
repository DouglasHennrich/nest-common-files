# Presenters

## 7. Presenter

### 7.1 Interface and Implementation

```typescript
// File: presenters/[entity-name].presenter.ts
import { Injectable } from '@nestjs/common';
import { AbstractPresenter } from '@/@shared/classes/presenter';
import { I[EntityName]Model } from '../models/[entity-name].struct';

export type T[EntityName]BasicPresenterResponse = Omit<
  I[EntityName]Model,
  'createdAt' | 'updatedAt' | 'deletedAt'
>;

export type T[EntityName]PresenterResponse = T[EntityName]BasicPresenterResponse & {
  // Add relationships if necessary
};

export abstract class I[EntityName]Presenter extends AbstractPresenter<
  I[EntityName]Model,
  T[EntityName]PresenterResponse
> {
  abstract presentWithoutRelations(
    [entityName]: I[EntityName]Model,
  ): Omit<T[EntityName]PresenterResponse, 'relatedEntity'>;
}

@Injectable()
export class [EntityName]Presenter implements I[EntityName]Presenter {
  constructor(
    // Inject other presenters if necessary for relationships
  ) {}

  present([entityName]: I[EntityName]Model): T[EntityName]PresenterResponse {
    return {
      id: [entityName].id,
      name: [entityName].name,
      description: [entityName].description,

      // Conditional relationships
      // relatedEntity: [entityName].relatedEntity
      //   ? this.relatedPresenter.present([entityName].relatedEntity)
      //   : undefined,
    };
  }

  presentWithoutRelations(
    [entityName]: I[EntityName]Model,
  ): Omit<T[EntityName]PresenterResponse, 'relatedEntity'> {
    return {
      id: [entityName].id,
      name: [entityName].name,
      description: [entityName].description,
    };
  }

  presentMany([entityNamePlural]: I[EntityName]Model[]): T[EntityName]PresenterResponse[] {
    return [entityNamePlural].map(([entityName]) => this.present([entityName]));
  }
}
```