import { Injectable, OnModuleInit } from '@nestjs/common';
import { IBackofficeConfigsRepository } from '../repositories/backoffice-configs.repository';
import { BackofficeConfigsSingleton } from '../singletons/backoffice-configs.singleton';
import { ILogger } from '@/@shared/classes/custom-logger';

@Injectable()
export class BackofficeConfigsInitializerService implements OnModuleInit {
  constructor(
    private readonly backofficeConfigsRepository: IBackofficeConfigsRepository,
    private logger: ILogger,
  ) {
    this.logger.setContextName(BackofficeConfigsInitializerService.name);
  }

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('Initializing BackofficeConfigs singleton...');

      await BackofficeConfigsSingleton.initialize(
        this.backofficeConfigsRepository,
      );

      this.logger.log('BackofficeConfigs singleton initialized successfully');
    } catch (error) {
      this.logger.error(
        `Failed to initialize BackofficeConfigs singleton: ${error}`,
      );
      throw error; // Re-throw to prevent app startup if initialization fails
    }
  }
}
