import { Injectable } from '@nestjs/common';
import { BackofficeConfigsEntity } from '../entities/backoffice-configs.entity';
import { AbstractRepository } from '@/@shared/classes/repository';
import { IBackofficeConfigsModel } from '../models/backoffice-configs.struct';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TEnvService } from '@/modules/env/services/env.service';
import { CustomLogger } from '@/@shared/classes/custom-logger';

export class IBackofficeConfigsRepository extends AbstractRepository<
  BackofficeConfigsEntity,
  IBackofficeConfigsModel
> {}

@Injectable()
export class BackofficeConfigsRepository extends IBackofficeConfigsRepository {
  constructor(
    @InjectRepository(BackofficeConfigsEntity)
    readonly backofficeConfigsRepository: Repository<BackofficeConfigsEntity>,
    readonly envService: TEnvService,
  ) {
    super(
      backofficeConfigsRepository,
      envService,
      new CustomLogger(envService, BackofficeConfigsRepository.name),
    );
  }
}
