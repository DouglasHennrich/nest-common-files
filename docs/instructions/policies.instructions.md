# Authorization Policies

## 9. Authorization Policies with CASL

### 9.1 Policies with CASL Ability

```typescript
// File: policies/create-[entity-name].policy.ts
import { TAppAbility } from '@/modules/authorization/casl-ability.factory';
import { IPolicyHandler } from '@/modules/authorization/models/polict.struct';

export class Create[EntityName]Policy implements IPolicyHandler {
  handle(ability: TAppAbility): boolean {
    return ability.can('write', '[entity-name-plural]');
  }
}
```

**Mandatory rules for policies:**
- Always use the plural form of the resource (ex: 'agendas') as subject.
- For creation and update, use the action 'write'.
- For reading, use 'read'.
- For deletion, use 'delete'.
- Always use the pattern: `ability.can(action, subject)`