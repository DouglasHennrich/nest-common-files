# Instruções para criação de Testes em TypeScript com NestJS

## 1. Estrutura básica dos testes

### 1.1 Testes Unitários
- Teste isolado de uma unidade de código (controller, service, repository)
- Nome do arquivo: `nome-do-arquivo.spec.ts`
- Localização: pasta `@tests` dentro do diretório do componente

### 1.2 Testes de Integração (E2E)
- Teste de fluxo completo da aplicação
- Nome do arquivo: `nome-do-arquivo.spec.e2e.ts`
- Localização: pasta `test` na raiz do projeto

## 2. Configuração básica do Jest

### 2.1 Scripts do package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testRegex='.*\\.spec\\.ts$' --testPathIgnorePatterns='.*\\.spec\\.e2e\\.ts$'",
    "test:e2e": "jest --testRegex='.*\\.spec\\.e2e\\.ts$'",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand"
  }
}
```

### 2.2 Configuração do Jest
```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.(e2e\\.)?ts$",
    "testPathIgnorePatterns": [
      "<rootDir>/@shared/tests/factories/",
      "<rootDir>/@shared/tests/stubs/",
      "<rootDir>/@shared/tests/setup.ts"
    ],
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/$1"
    },
    "setupFilesAfterEnv": ["<rootDir>/@shared/tests/setup.ts"]
  }
}
```

## 3. Imports necessários

### 3.1 Para testes unitários de Controller
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { Result } from '@/@shared/classes/result';
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';
import { AccountFactory } from '@/@shared/tests/factories/account.factory';
import { RequestContextFactory } from '@/@shared/tests/factories/request-context.factory';
import { ServiceStubs } from '@/@shared/tests/stubs/service.stubs';
```

### 3.2 Para testes unitários de Service
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { Result } from '@/@shared/classes/result';
import { ZodError } from 'zod';
```

### 3.3 Para testes E2E
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
```

## 4. Template para teste unitário de Controller

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { ActionNomeFornecidoController } from '../action-nome-fornecido.controller';
import { TActionNomeFornecidoService } from '../../services/action-nome-fornecido.service';
import { AccountFactory } from '@/@shared/tests/factories/account.factory';
import { RequestContextFactory } from '@/@shared/tests/factories/request-context.factory';
import { NomeFornecidoFactory } from '@/@shared/tests/factories/nome-fornecido.factory';
import { ServiceStubs } from '@/@shared/tests/stubs/service.stubs';
import { Result } from '@/@shared/classes/result';
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';

describe('ActionNomeFornecidoController', () => {
  let controller: ActionNomeFornecidoController;
  let service: any;

  beforeEach(async () => {
    service = ServiceStubs.createMockService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActionNomeFornecidoController],
      providers: [
        {
          provide: TActionNomeFornecidoService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ActionNomeFornecidoController>(
      ActionNomeFornecidoController,
    );
  });

  describe('actionNomeFornecido', () => {
    it('should execute action successfully', async () => {
      // Arrange
      const user = AccountFactory.createProfessional();
      const context = RequestContextFactory.create();
      const actionDto = NomeFornecidoFactory.createActionDto();

      const expectedResult = NomeFornecidoFactory.createResult();
      service.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.actionNomeFornecido(
        user,
        context,
        actionDto,
      );

      // Assert
      expect(service.execute).toHaveBeenCalledWith({
        ...actionDto,
        userId: user.id,
        userType: user.userType,
      });
      expect(result).toEqual(expectedResult.getValue());
    });

    it('should throw application exception with context when service returns error', async () => {
      // Arrange
      const user = AccountFactory.createProfessional();
      const context = RequestContextFactory.create();
      const actionDto = NomeFornecidoFactory.createActionDto();

      const error = new Error('Test error');
      Object.setPrototypeOf(error, AbstractApplicationException.prototype);
      service.execute.mockResolvedValue(Result.fail(error));

      // Act & Assert
      await expect(
        controller.actionNomeFornecido(user, context, actionDto),
      ).rejects.toThrow(error);

      expect((error as any).context).toBe(context);
    });

    it('should throw generic error without setting context when service returns non-application error', async () => {
      // Arrange
      const user = AccountFactory.createProfessional();
      const context = RequestContextFactory.create();
      const actionDto = NomeFornecidoFactory.createActionDto();

      const error = new Error('Generic error');
      service.execute.mockResolvedValue(Result.fail(error));

      // Act & Assert
      await expect(
        controller.actionNomeFornecido(user, context, actionDto),
      ).rejects.toThrow(error);

      expect((error as any).context).toBeUndefined();
    });
  });
});
```

## 5. Template para teste unitário de Service

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { ActionNomeFornecidoService } from '../action-nome-fornecido.service';
import { INomeFornecidosRepository } from '../../repositories/nome-fornecidos.repository';
import { INomeFornecidoPresenter } from '../../presenters/nome-fornecido.presenter';
import { NomeFornecidoFactory } from '@/@shared/tests/factories/nome-fornecido.factory';
import { RequestContextFactory } from '@/@shared/tests/factories/request-context.factory';
import { GenerateRandom } from '@/@shared/utils/generateRandom';
import { Result } from '@/@shared/classes/result';
import { ZodError } from 'zod';
import { NomeFornecidoNotFoundException } from '../../errors/nome-fornecido-not-found.exception';

describe('ActionNomeFornecidoService', () => {
  let service: ActionNomeFornecidoService;
  let repository: jest.Mocked<INomeFornecidosRepository>;
  let presenter: jest.Mocked<INomeFornecidoPresenter>;

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockPresenter = {
      present: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionNomeFornecidoService,
        {
          provide: INomeFornecidosRepository,
          useValue: mockRepository,
        },
        {
          provide: INomeFornecidoPresenter,
          useValue: mockPresenter,
        },
      ],
    }).compile();

    service = module.get<ActionNomeFornecidoService>(ActionNomeFornecidoService);
    repository = module.get(INomeFornecidosRepository);
    presenter = module.get(INomeFornecidoPresenter);
  });

  describe('execute', () => {
    it('should execute action successfully', async () => {
      // Arrange
      const serviceDto = NomeFornecidoFactory.createServiceDto();
      const context = RequestContextFactory.create();
      const entity = NomeFornecidoFactory.createEntity({
        id: GenerateRandom.id(),
      });
      const presentedResult = NomeFornecidoFactory.createPresenterResponse();

      repository.create.mockResolvedValue(entity);
      presenter.present.mockReturnValue(presentedResult);

      // Act
      const result = await service.execute(serviceDto, context);

      // Assert
      expect(result.isSuccess()).toBeTruthy();
      expect(result.getValue()).toEqual(presentedResult);
      expect(repository.create).toHaveBeenCalledWith(serviceDto);
      expect(presenter.present).toHaveBeenCalledWith(entity);
    });

    it('should return error when validation fails', async () => {
      // Arrange
      const invalidDto = { ...NomeFornecidoFactory.createServiceDto(), requiredField: undefined };
      const context = RequestContextFactory.create();

      // Act
      const result = await service.execute(invalidDto, context);

      // Assert
      expect(result.isFailure()).toBeTruthy();
      expect(result.error).toBeInstanceOf(ZodError);
    });

    it('should return error when entity not found', async () => {
      // Arrange
      const serviceDto = NomeFornecidoFactory.createServiceDto({
        id: GenerateRandom.id(),
      });
      const context = RequestContextFactory.create();

      repository.findById.mockResolvedValue(null);

      // Act
      const result = await service.execute(serviceDto, context);

      // Assert
      expect(result.isFailure()).toBeTruthy();
      expect(result.error).toBeInstanceOf(NomeFornecidoNotFoundException);
    });

    it('should return error when repository throws exception', async () => {
      // Arrange
      const serviceDto = NomeFornecidoFactory.createServiceDto();
      const context = RequestContextFactory.create();
      const error = new Error('Database error');

      repository.create.mockRejectedValue(error);

      // Act
      const result = await service.execute(serviceDto, context);

      // Assert
      expect(result.isFailure()).toBeTruthy();
      expect(result.error).toBe(error);
    });
  });

  describe('validateDto', () => {
    it('should validate valid DTO successfully', async () => {
      // Arrange
      const validDto = NomeFornecidoFactory.createServiceDto();
      const context = RequestContextFactory.create();

      // Act
      const result = await service.validateDto(validDto, context);

      // Assert
      expect(result.isSuccess()).toBeTruthy();
      expect(result.getValue()).toEqual(validDto);
    });

    it('should return error for invalid DTO', async () => {
      // Arrange
      const invalidDto = { ...NomeFornecidoFactory.createServiceDto(), requiredField: undefined };
      const context = RequestContextFactory.create();

      // Act
      const result = await service.validateDto(invalidDto, context);

      // Assert
      expect(result.isFailure()).toBeTruthy();
      expect(result.error).toBeInstanceOf(ZodError);
    });
  });
});
```

## 6. Template para teste E2E

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { DatabaseModule } from '@/@database/database.module';
import { DataSource } from 'typeorm';
import { AuthHelper } from '@/@shared/tests/auth';
import { AccountFactory } from '@/@shared/tests/factories/account.factory';

describe('ActionNomeFornecidoController (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authHelper: AuthHelper;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    authHelper = new AuthHelper(app);

    await app.init();
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM nome_fornecido');
    await app.close();
  });

  describe('POST /nome-fornecidos', () => {
    it('should create nome fornecido successfully', async () => {
      // Arrange
      const user = AccountFactory.createProfessional();
      const token = await authHelper.generateToken(user);
      const createDto = {
        name: 'Test Name',
        description: 'Test Description',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/nome-fornecidos')
        .set('Authorization', `Bearer ${token}`)
        .send(createDto)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createDto.name);
      expect(response.body.description).toBe(createDto.description);
    });

    it('should return 400 when validation fails', async () => {
      // Arrange
      const user = AccountFactory.createProfessional();
      const token = await authHelper.generateToken(user);
      const invalidDto = {
        name: '', // Campo obrigatório vazio
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/nome-fornecidos')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidDto)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('validation');
    });

    it('should return 401 when not authenticated', async () => {
      // Arrange
      const createDto = {
        name: 'Test Name',
        description: 'Test Description',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/nome-fornecidos')
        .send(createDto)
        .expect(401);
    });

    it('should return 403 when user lacks permission', async () => {
      // Arrange
      const user = AccountFactory.createCurrentUser({ 
        userType: 'PATIENT' as any 
      });
      const token = await authHelper.generateToken(user);
      const createDto = {
        name: 'Test Name',
        description: 'Test Description',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/nome-fornecidos')
        .set('Authorization', `Bearer ${token}`)
        .send(createDto)
        .expect(403);
    });
  });

  describe('GET /nome-fornecidos', () => {
    it('should list nome fornecidos successfully', async () => {
      // Arrange
      const user = AccountFactory.createProfessional();
      const token = await authHelper.generateToken(user);

      // Criar alguns registros de teste
      await dataSource.query(`
        INSERT INTO nome_fornecido (id, name, description, created_at, updated_at) 
        VALUES 
          ('1', 'Test 1', 'Description 1', NOW(), NOW()),
          ('2', 'Test 2', 'Description 2', NOW(), NOW())
      `);

      // Act
      const response = await request(app.getHttpServer())
        .get('/nome-fornecidos')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('items');
      expect(response.body.items).toHaveLength(2);
      expect(response.body).toHaveProperty('total');
      expect(response.body.total).toBe(2);
    });

    it('should return paginated results', async () => {
      // Arrange
      const user = AccountFactory.createProfessional();
      const token = await authHelper.generateToken(user);

      // Criar registros de teste
      for (let i = 1; i <= 15; i++) {
        await dataSource.query(`
          INSERT INTO nome_fornecido (id, name, description, created_at, updated_at) 
          VALUES ('${i}', 'Test ${i}', 'Description ${i}', NOW(), NOW())
        `);
      }

      // Act
      const response = await request(app.getHttpServer())
        .get('/nome-fornecidos?page=1&offset=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert
      expect(response.body.items).toHaveLength(10);
      expect(response.body.total).toBe(15);
      expect(response.body.page).toBe(1);
    });
  });
});
```

## 7. Factories para testes

### 7.1 Template de Factory
```typescript
import { TCurrentUser } from '@/modules/authenticate/guard/jwt-authenticate.guard';
import { UserTypeEnum } from '@/modules/accounts/models/account.struct';
import { Result } from '@/@shared/classes/result';

export class NomeFornecidoFactory {
  static createEntity(overrides = {}) {
    return {
      id: 'entity-123',
      name: 'Test Name',
      description: 'Test Description',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createServiceDto(overrides = {}) {
    return {
      name: 'Test Name',
      description: 'Test Description',
      userId: 'user-123',
      userType: UserTypeEnum.NUTRITIONIST,
      ...overrides,
    };
  }

  static createActionDto(overrides = {}) {
    return {
      name: 'Test Name',
      description: 'Test Description',
      ...overrides,
    };
  }

  static createPresenterResponse(overrides = {}) {
    return {
      id: 'entity-123',
      name: 'Test Name',
      description: 'Test Description',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    };
  }

  static createResult(overrides = {}) {
    const entity = this.createEntity(overrides);
    const presented = this.createPresenterResponse(overrides);
    return Result.success(presented);
  }

  static createListResult(overrides = {}) {
    const items = [
      this.createPresenterResponse({ id: '1', name: 'Test 1' }),
      this.createPresenterResponse({ id: '2', name: 'Test 2' }),
    ];
    return Result.success({
      items,
      total: 2,
      page: 1,
      ...overrides,
    });
  }

  static createPaginatedResult(overrides = {}) {
    return this.createListResult(overrides);
  }
}
```

## 8. Stubs para testes

### 8.1 Service Stubs
```typescript
import { jest } from '@jest/globals';

export class ServiceStubs {
  static createMockService(): { execute: jest.Mock } {
    return {
      execute: jest.fn(),
    };
  }

  static createSuccessfulService<T = any>(
    returnValue: T,
  ): { execute: jest.Mock } {
    const mockFn = jest.fn() as any;
    mockFn.mockResolvedValue(returnValue);
    return {
      execute: mockFn,
    };
  }

  static createFailedService(error: any): { execute: jest.Mock } {
    const mockFn = jest.fn() as any;
    mockFn.mockRejectedValue(error);
    return {
      execute: mockFn,
    };
  }
}
```

### 8.2 Repository Stubs
```typescript
export class RepositoryStubs {
  static createMockRepository() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findAndCount: jest.fn(),
    };
  }
}
```

## 9. Configuração de setup global

### 9.1 Setup básico
```typescript
import 'reflect-metadata';
import { jest, beforeEach } from '@jest/globals';

// Configuração global para todos os testes
beforeEach(() => {
  jest.clearAllMocks();
});

// Configuração de timeout para testes
jest.setTimeout(30000);

// Mock global para console para evitar logs desnecessários nos testes
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
```

## 10. Padrões de testes

### 10.1 Estrutura AAA (Arrange, Act, Assert)
```typescript
it('should describe what the test does', async () => {
  // Arrange - Preparar dados e mocks
  const input = createTestInput();
  const expectedOutput = createExpectedOutput();
  mockService.method.mockResolvedValue(expectedOutput);

  // Act - Executar a ação
  const result = await systemUnderTest.execute(input);

  // Assert - Verificar o resultado
  expect(result).toEqual(expectedOutput);
  expect(mockService.method).toHaveBeenCalledWith(input);
});
```

### 10.2 Testes de casos de sucesso
```typescript
describe('when everything is valid', () => {
  it('should return success result', async () => {
    // Teste do caso feliz
  });

  it('should call dependencies with correct parameters', async () => {
    // Teste de integração com dependências
  });
});
```

### 10.3 Testes de casos de erro
```typescript
describe('when validation fails', () => {
  it('should return validation error', async () => {
    // Teste de erro de validação
  });
});

describe('when entity not found', () => {
  it('should return not found error', async () => {
    // Teste de erro de entidade não encontrada
  });
});
```

## 11. Convenções de nomenclatura

### 11.1 Arquivos de teste
- **Teste unitário**: `nome-do-arquivo.spec.ts`
- **Teste E2E**: `nome-do-arquivo.spec.e2e.ts`
- **Localização unitário**: `src/modules/modulo/componente/@tests/`
- **Localização E2E**: `test/`

### 11.2 Descrição dos testes
```typescript
// ✅ Bom
describe('CreateUserService', () => {
  describe('execute', () => {
    it('should create user successfully', () => {});
    it('should return error when email already exists', () => {});
  });
});

// ❌ Ruim
describe('CreateUserService', () => {
  it('test1', () => {});
  it('test2', () => {});
});
```

## 12. Organização dos arquivos de teste

```
src/
  modules/
    users/
      controllers/
        @tests/
          create-user.controller.spec.ts
          list-users.controller.spec.ts
      services/
        @tests/
          create-user.service.spec.ts
          list-users.service.spec.ts
      repositories/
        @tests/
          users.repository.spec.ts
  @shared/
    tests/
      factories/
        user.factory.ts
        account.factory.ts
        request-context.factory.ts
      stubs/
        service.stubs.ts
        repository.stubs.ts
      setup.ts
      auth.ts
test/
  users.spec.e2e.ts
  auth.spec.e2e.ts
```

## 13. Comandos úteis

### 13.1 Executar testes
```bash
# Todos os testes
pnpm test

# Apenas testes unitários
pnpm test:unit

# Apenas testes E2E
pnpm test:e2e

# Testes em modo watch
pnpm test:watch

# Testes com coverage
pnpm test:cov

# Depuração de testes
pnpm test:debug
```

### 13.2 Executar testes específicos
```bash
# Arquivo específico
pnpm test create-user.controller.spec.ts

# Padrão de nome
pnpm test --testNamePattern="should create user"

# Pasta específica
pnpm test src/modules/users
```

## 14. Checklist para testes

### 14.1 Testes unitários
- [ ] Testa casos de sucesso
- [ ] Testa casos de erro
- [ ] Testa validação de entrada
- [ ] Testa integração com dependências
- [ ] Usa factories para criar dados
- [ ] Usa stubs para dependências
- [ ] Usa `GenerateRandom.id()` para UUIDs
- [ ] Usa `GenerateRandom` para dados aleatórios
- [ ] Valida erros por instância, não por mensagem
- [ ] Segue padrão AAA
- [ ] Tem descrições claras

### 14.2 Testes E2E
- [ ] Testa fluxo completo
- [ ] Testa autenticação
- [ ] Testa autorização
- [ ] Testa validação de entrada
- [ ] Testa diferentes códigos de status
- [ ] Limpa dados após teste
- [ ] Usa dados realistas

## 15. Boas práticas para validação de erros

### 15.1 Validação por instância de erro
**SEMPRE** valide erros personalizados pela instância da classe de erro, não pela mensagem:

```typescript
// ✅ CORRETO - Validação por instância
expect(result.error).toBeInstanceOf(DocumentNotFoundException);
expect(result.error).toBeInstanceOf(DocumentProfessionalMismatchException);
expect(result.error).toBeInstanceOf(UserNotAuthorizedException);

// ❌ INCORRETO - Validação por mensagem
expect(result.error?.message).toContain('not found');
expect(result.error?.message).toContain('professional');
expect(result.error?.message).toContain('unauthorized');
```

### 15.2 Exceções para validação por mensagem
Use validação por mensagem **APENAS** para:
- Erros abstratos/genéricos: `AbstractApplicationException`
- Erros padrão: `DefaultException`
- Erros de validação do Zod: `ZodError`

```typescript
// ✅ CORRETO - Casos onde validação por mensagem é aceitável
expect(result.error).toBeInstanceOf(ZodError);
expect(result.error).toBeInstanceOf(AbstractApplicationException);
expect(result.error?.message).toContain('validation failed');

// Para DefaultException, pode validar por mensagem específica
expect(result.error).toBeInstanceOf(DefaultException);
expect(result.error?.message).toContain('erro específico esperado');
```

### 15.3 Imports necessários para validação de erros
Sempre importe as classes de erro específicas que você vai testar:

```typescript
// Imports para validação de erros específicos
import { DocumentNotFoundException } from '../../../errors/document-not-found.exception';
import { DocumentProfessionalMismatchException } from '../../../errors/document-professional-mismatch.exception';
import { UserNotAuthorizedException } from '../../../errors/user-not-authorized.exception';

// Imports para validação genérica
import { AbstractApplicationException } from '@/@shared/errors/abstract-application-exception';
import { DefaultException } from '@/@shared/errors/default.exception';
import { ZodError } from 'zod';
```

### 15.4 Exemplo completo de validação de erros
```typescript
import { GenerateRandom } from '@/@shared/utils/generateRandom';

describe('execute', () => {
  it('should return DocumentNotFoundException when document not found', async () => {
    // Arrange
    const serviceDto = { 
      id: GenerateRandom.id(), 
      professionalId: GenerateRandom.id() 
    };
    repository.findById.mockResolvedValue(undefined);

    // Act
    const result = await service.execute(serviceDto);

    // Assert
    expect(result.isFailure()).toBeTruthy();
    expect(result.error).toBeInstanceOf(DocumentNotFoundException);
  });

  it('should return DocumentProfessionalMismatchException when professional mismatch', async () => {
    // Arrange
    const documentId = GenerateRandom.id();
    const requestingProfessionalId = GenerateRandom.id();
    const documentOwnerProfessionalId = GenerateRandom.id();
    
    const serviceDto = { 
      id: documentId, 
      professionalId: requestingProfessionalId 
    };
    const entity = DocumentFactory.createEntity({ 
      id: documentId,
      professionalId: documentOwnerProfessionalId 
    });
    repository.findById.mockResolvedValue(entity);

    // Act
    const result = await service.execute(serviceDto);

    // Assert
    expect(result.isFailure()).toBeTruthy();
    expect(result.error).toBeInstanceOf(DocumentProfessionalMismatchException);
  });

  it('should return ZodError when validation fails', async () => {
    // Arrange
    const invalidDto = { 
      id: GenerateRandom.text(8), // Texto inválido como UUID
      professionalId: 'invalid-uuid' 
    };

    // Act
    const result = await service.execute(invalidDto);

    // Assert
    expect(result.isFailure()).toBeTruthy();
    expect(result.error).toBeInstanceOf(ZodError);
  });
});
```

```

## 16. Geração de dados de teste com GenerateRandom

### 16.1 Uso obrigatório para UUIDs
**SEMPRE** use `GenerateRandom.id()` para gerar UUIDs válidos nos testes:

```typescript
import { GenerateRandom } from '@/@shared/utils/generateRandom';

// ✅ CORRETO - Uso do GenerateRandom para UUIDs
const documentId = GenerateRandom.id();
const professionalId = GenerateRandom.id();
const userId = GenerateRandom.id();

// ❌ INCORRETO - UUIDs hardcoded ou inválidos
const documentId = 'document-123';
const professionalId = 'prof-456';
const userId = 'invalid-uuid';
```

### 16.2 Utilidades disponíveis no GenerateRandom
O `GenerateRandom` oferece várias utilidades para geração de dados de teste:

```typescript
// Gerar UUID válido (v4)
const id = GenerateRandom.id();
// Resultado: "550e8400-e29b-41d4-a716-446655440000"

// Gerar número aleatório
const number = GenerateRandom.number(6);
// Resultado: 123456

// Gerar texto aleatório
const text = GenerateRandom.text(10);
// Resultado: "aBc123XyZ."

// Gerar string mista com caracteres especiais
const mixed = GenerateRandom.mixed(12);
// Resultado: "aB3!@#xY9$%^"
```

### 16.3 Exemplo prático em testes
```typescript
import { GenerateRandom } from '@/@shared/utils/generateRandom';

describe('GetDocumentService', () => {
  it('should get document successfully', async () => {
    // Arrange
    const documentId = GenerateRandom.id(); // UUID válido
    const professionalId = GenerateRandom.id(); // UUID válido
    
    const serviceDto = {
      id: documentId,
      professionalId: professionalId,
    };
    
    const entity = DocumentFactory.createEntity({
      id: documentId,
      professionalId: professionalId,
    });

    // Act & Assert...
  });

  it('should return error when professional mismatch', async () => {
    // Arrange
    const documentId = GenerateRandom.id();
    const requestingProfessionalId = GenerateRandom.id();
    const documentOwnerProfessionalId = GenerateRandom.id();
    
    const serviceDto = {
      id: documentId,
      professionalId: requestingProfessionalId,
    };
    
    const entity = DocumentFactory.createEntity({
      id: documentId,
      professionalId: documentOwnerProfessionalId, // Professional diferente
    });

    // Act & Assert...
  });
});
```

### 16.4 Casos de uso específicos

#### 16.4.1 Para testes de validação
```typescript
// Gerar dados inválidos para testes de validação
const invalidId = GenerateRandom.text(8); // Não é UUID
const invalidNumber = GenerateRandom.text(5); // Texto onde deveria ser número
```

#### 16.4.2 Para testes de integração
```typescript
// Gerar dados únicos para cada teste
const uniqueEmail = `test${GenerateRandom.number(6)}@example.com`;
const uniqueName = `Test User ${GenerateRandom.text(5)}`;
```

#### 16.4.3 Para senhas e tokens
```typescript
// Gerar senhas ou tokens seguros
const password = GenerateRandom.mixed(16);
const token = GenerateRandom.mixed(32);
```

### 16.5 Import necessário
Sempre importe o `GenerateRandom` quando precisar gerar dados de teste:

```typescript
import { GenerateRandom } from '@/@shared/utils/generateRandom';
```

### 16.6 Benefícios do uso do GenerateRandom
- **Dados únicos**: Evita conflitos entre testes
- **Dados válidos**: Garante que UUIDs sejam válidos
- **Flexibilidade**: Diferentes tipos de dados para diferentes necessidades
- **Consistência**: Padrão único em todo o projeto
- **Manutenibilidade**: Facilita alterações futuras na geração de dados

---
Siga este padrão sempre que for criar testes unitários ou de integração.
