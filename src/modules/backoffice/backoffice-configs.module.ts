import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackofficeConfigsEntity } from './entities/backoffice-configs.entity';
import {
  UpdateBackofficeConfigsService,
  TUpdateBackofficeConfigsService,
} from './services/update-backoffice-configs.service';
import { BackofficeConfigsInitializerService } from './services/backoffice-configs-initializer.service';
import {
  GetBackofficeConfigsService,
  TGetBackofficeConfigsService,
} from './services/get-backoffice-configs.service';
import {
  IBackofficeConfigsRepository,
  BackofficeConfigsRepository,
} from './repositories/backoffice-configs.repository';
import { UpdateBackofficeConfigsController } from './controllers/update-backoffice-configs.controller';
import { GetBackofficeConfigsController } from './controllers/get-backoffice-configs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BackofficeConfigsEntity])],
  controllers: [
    GetBackofficeConfigsController,
    UpdateBackofficeConfigsController,
  ],
  providers: [
    /// //////////////////////////
    //  Repositories
    /// //////////////////////////
    {
      provide: IBackofficeConfigsRepository,
      useClass: BackofficeConfigsRepository,
    },

    /// //////////////////////////
    //  Services
    /// //////////////////////////
    {
      provide: TUpdateBackofficeConfigsService,
      useClass: UpdateBackofficeConfigsService,
    },
    {
      provide: TGetBackofficeConfigsService,
      useClass: GetBackofficeConfigsService,
    },

    /// //////////////////////////
    //  Initializer Service
    /// //////////////////////////
    BackofficeConfigsInitializerService,
  ],
  exports: [IBackofficeConfigsRepository, TUpdateBackofficeConfigsService],
})
export class BackofficeConfigsModule {}
