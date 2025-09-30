# Models and Entities

## 1. Model (Interface)

### 1.1 Base Structure

```typescript
// File: models/[entity-name].struct.ts
export interface I[EntityName]Model {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  // Specific entity properties
  name: string;
  description?: string;

  /// //////////////////////////
  //  Relations
  /// //////////////////////////
  // Define relationships here
  // Always use the pattern:
  // relatedEntity?: IRelatedEntityModel | null | undefined;
}
```

## 2. Entity (TypeORM)

### 2.1 Base Structure

```typescript
// File: entities/[entity-name].entity.ts
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { I[EntityName]Model } from '../models/[entity-name].struct';

@Entity('[entity-name-plural]')
export class [EntityName]Entity implements I[EntityName]Model {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  // Specific properties
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  /// //////////////////////////
  //  Relations
  /// //////////////////////////
  // Define relationships here
  // Always use the pattern:
  // @ManyToOne(() => RelatedEntity, (related) => related.entities)
  // @JoinColumn({ name: 'related_entity_id' })
  // relatedEntity?: RelatedEntity | null | undefined;
}
```

### 2.2 Relationships

```typescript
// One-to-Many
@OneToMany(() => OtherEntity, (other) => other.entity)
otherEntities: OtherEntity[];

// Many-to-One
@ManyToOne(() => OtherEntity, (other) => other.entities)
@JoinColumn({ name: 'other_entity_id' })
otherEntity: OtherEntity;

@Column({ name: 'other_entity_id' })
otherEntityId: string;
```