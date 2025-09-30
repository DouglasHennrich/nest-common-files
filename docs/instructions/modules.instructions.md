# Module Configuration

## 11. Module (Follow instructions from module.instructions.md)

```typescript
// File: [entity-name-plural].module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { [EntityName]Entity } from './entities/[entity-name].entity';
import {
  I[EntityNamePlural]Repository,
  [EntityNamePlural]Repository,
} from './repositories/[entity-name-plural].repository';
import {
  I[EntityName]Presenter,
  [EntityName]Presenter,
} from './presenters/[entity-name].presenter';

// Services
import {
  TCreate[EntityName]Service,
  Create[EntityName]Service,
} from './services/create-[entity-name].service';
import {
  TList[EntityNamePlural]Service,
  List[EntityNamePlural]Service,
} from './services/list-[entity-name-plural].service';
import {
  TGet[EntityName]Service,
  Get[EntityName]Service,
} from './services/get-[entity-name].service';
import {
  TUpdate[EntityName]Service,
  Update[EntityName]Service,
} from './services/update-[entity-name].service';
import {
  TDelete[EntityName]Service,
  Delete[EntityName]Service,
} from './services/delete-[entity-name].service';

// Controllers
import { Create[EntityName]Controller } from './controllers/create-[entity-name].controller';
import { List[EntityNamePlural]Controller } from './controllers/list-[entity-name-plural].controller';
import { Get[EntityName]Controller } from './controllers/get-[entity-name].controller';
import { Update[EntityName]Controller } from './controllers/update-[entity-name].controller';
import { Delete[EntityName]Controller } from './controllers/delete-[entity-name].controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      [EntityName]Entity,
    ]),
    // Other necessary modules
  ],
  controllers: [
    /// //////////////////////////
    //  [Module Name]
    /// //////////////////////////
    Create[EntityName]Controller,
    List[EntityNamePlural]Controller,
    Get[EntityName]Controller,
    Update[EntityName]Controller,
    Delete[EntityName]Controller,
  ],
  providers: [
    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    {
      provide: I[EntityNamePlural]Repository,
      useClass: [EntityNamePlural]Repository,
    },

    /// //////////////////////////
    //  Services
    /// //////////////////////////
    {
      provide: TCreate[EntityName]Service,
      useClass: Create[EntityName]Service,
    },
    {
      provide: TList[EntityNamePlural]Service,
      useClass: List[EntityNamePlural]Service,
    },
    {
      provide: TGet[EntityName]Service,
      useClass: Get[EntityName]Service,
    },
    {
      provide: TUpdate[EntityName]Service,
      useClass: Update[EntityName]Service,
    },
    {
      provide: TDelete[EntityName]Service,
      useClass: Delete[EntityName]Service,
    },

    /// //////////////////////////
    //  Presenters
    /// //////////////////////////
    {
      provide: I[EntityName]Presenter,
      useClass: [EntityName]Presenter,
    },
  ],
  exports: [
    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    I[EntityNamePlural]Repository,

    /// //////////////////////////
    //  Services
    /// //////////////////////////
    TCreate[EntityName]Service,
    // Export only services necessary for other modules

    /// //////////////////////////
    //  Presenters
    /// //////////////////////////
    I[EntityName]Presenter,
    // Export only presenters necessary for other modules
  ],
})
export class [EntityNamePlural]Module {}
```