import { IBackofficeConfigsModel } from '../models/backoffice-configs.struct';
import { IBackofficeConfigsRepository } from '../repositories/backoffice-configs.repository';

export class BackofficeConfigsSingleton {
  public static shared: IBackofficeConfigsModel | null = null;

  private static repository: IBackofficeConfigsRepository | null = null;

  private static initialized = false;

  private constructor() {
    // Private constructor for singleton
  }

  public static async initialize(
    repository: IBackofficeConfigsRepository,
  ): Promise<void> {
    if (BackofficeConfigsSingleton.initialized) {
      return;
    }

    BackofficeConfigsSingleton.repository = repository;

    try {
      // Try to find existing config
      const existingConfig = await repository.findLast({
        where: {},
      });

      if (existingConfig) {
        BackofficeConfigsSingleton.shared = existingConfig;
      } else {
        // Create default config if none exists
        const defaultConfig = await repository.create({
          debugLogging: false,
        });
        BackofficeConfigsSingleton.shared = defaultConfig;
      }

      BackofficeConfigsSingleton.initialized = true;
    } catch (error) {
      throw new Error(
        `Failed to initialize BackofficeConfigsSingleton: ${error}`,
      );
    }
  }

  public static async updateConfigs(
    updates: Partial<IBackofficeConfigsModel>,
  ): Promise<void> {
    if (
      !BackofficeConfigsSingleton.shared ||
      !BackofficeConfigsSingleton.repository
    ) {
      throw new Error('BackofficeConfigsSingleton not initialized');
    }

    // Update in database first
    const updatedConfig = await BackofficeConfigsSingleton.repository.update(
      BackofficeConfigsSingleton.shared.id,
      updates,
    );

    // Update the shared instance
    BackofficeConfigsSingleton.shared = updatedConfig;
  }
}
