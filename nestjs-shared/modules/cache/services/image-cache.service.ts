import * as crypto from 'node:crypto';
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ILogger } from '../../../classes/custom-logger';
import { Result } from '../../../classes/result';

export abstract class TImageCacheService {
  abstract get(
    key: string,
    fetchFn: () => Promise<
      Result<{ buffer: Buffer; mimeType: string; size: number }>
    >,
  ): Promise<Result<{ buffer: Buffer; mimeType: string; size: number }>>;
  abstract delete(key: string): Promise<void>;
  abstract clear(): void;
  abstract getStats(): any;
}

@Injectable()
export class ImageCacheService implements TImageCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: ILogger,
  ) {
    this.logger.setContextName(ImageCacheService.name);
  }

  /**
   * Get cached image data or fetch and cache it
   */
  async get(
    key: string,
    fetchFn: () => Promise<
      Result<{ buffer: Buffer; mimeType: string; size: number }>
    >,
  ): Promise<Result<{ buffer: Buffer; mimeType: string; size: number }>> {
    return this.getOrSetCacheSmart(key, fetchFn);
  }

  /**
   * Delete image from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Removed image ${key} from cache`);
    } catch (error) {
      this.logger.warn(`Error deleting cached image ${key}: ${error}`);
    }
  }

  /**
   * Clear all cached images
   */
  clear(): void {
    try {
      // Redis cache manager doesn't have a reset method
      // We'll log that manual clearing may be needed
      this.logger.warn(
        'Redis cache clearing not supported. Manual intervention may be required.',
      );
    } catch (error) {
      this.logger.warn(`Error clearing cache: ${error}`);
    }
  }

  /**
   * Get cache statistics (if available)
   */
  getStats() {
    // Redis cache manager may not provide detailed stats
    // This is a basic implementation
    return {
      note: 'Detailed statistics not available for Redis cache manager',
      cacheType: 'redis',
    };
  }

  /// //////////////////////////
  //  Utilities
  /// //////////////////////////
  /** Calcula hash SHA256 de um buffer para cache inteligente */
  private getHash(data: Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /** Cache inteligente com fallback caso Redis esteja indisponível */
  private async getOrSetCacheSmart(
    key: string,
    fetchFn: () => Promise<
      Result<{ buffer: Buffer; mimeType: string; size: number }>
    >,
    ttl = 3600, // 1 hora por padrão para imagens
  ): Promise<Result<{ buffer: Buffer; mimeType: string; size: number }>> {
    try {
      const cached:
        | { data: Buffer; hash: string; mimeType: string; size: number }
        | undefined = await this.cacheManager.get(key);

      const fetchResult = await fetchFn();

      if (fetchResult.error) {
        return fetchResult;
      }

      const { buffer, mimeType, size } = fetchResult.getValue()!;

      const newHash = this.getHash(buffer);

      if (!cached || cached.hash !== newHash) {
        await this.cacheManager.set(
          key,
          { data: buffer, hash: newHash, mimeType, size },
          ttl,
        );
        this.logger.debug(`Cache atualizado para imagem ${key}`);
        return Result.success({ buffer, mimeType, size });
      }

      this.logger.debug(`Cache válido para imagem ${key}`);
      return Result.success({
        buffer: cached.data,
        mimeType: cached.mimeType,
        size: cached.size,
      });
    } catch (err) {
      // Fallback caso Redis falhe
      this.logger.warn(
        `Cache indisponível para imagem ${key}, retornando dados da API. Erro: ${(err as Error).message}`,
      );
      const fetchResult = await fetchFn();
      if (fetchResult.error) {
        return fetchResult;
      }
      return fetchResult;
    }
  }
}
