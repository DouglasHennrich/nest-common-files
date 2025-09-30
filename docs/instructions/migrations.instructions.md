# Migrations

## 14. Migrations

### 14.1 Create Migration Manually

```bash
pnpm run migration:create Creating[EntityName]Entity
```

### 14.2 Migration Structure

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Creating[EntityName]Entity1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: '[entity-name-plural]',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('[entity-name-plural]');
  }
}
```

### 14.3 Execute Migration

```bash
pnpm run migration:run
```