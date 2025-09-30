# Repositories

## 3. Repository

### 3.1 Interface and Implementation

```typescript
// File: repositories/[entity-name-plural].repository.ts
import { Injectable } from '@nestjs/common';
import { [EntityName]Entity } from '../entities/[entity-name].entity';
import { AbstractRepository } from '@/@shared/classes/repository';
import { I[EntityName]Model } from '../models/[entity-name].struct';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TEnvironment } from '@/modules/env/env';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '@/@shared/classes/custom-logger';

export class I[EntityNamePlural]Repository extends AbstractRepository<
  [EntityName]Entity,
  I[EntityName]Model
> {}

@Injectable()
export class [EntityNamePlural]Repository extends I[EntityNamePlural]Repository {
  constructor(
    @InjectRepository([EntityName]Entity)
    readonly [entityName]Repository: Repository<[EntityName]Entity>,
    readonly envService: TEnvService,
  ) {
    super([entityName]Repository, configService, new CustomLogger([EntityNamePlural]Repository.name));
  }
}
```