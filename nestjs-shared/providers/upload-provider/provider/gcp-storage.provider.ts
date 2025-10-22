import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { Result } from '../classes/result';
import { TEnvService } from '@/env/services/env.service';
import {
  IUploadProviderUploadFileDto,
  IS3UploadResult,
  IS3GetUrlResult,
  IS3DownloadResult,
  UploadProviderBucketEnum,
  TUploadProvider,
  IUploadProviderStorageOptions,
} from '../models/upload-provider.struct';
import { GenerateRandom } from '../utils/generateRandom';
import { ILogger } from '../classes/custom-logger';

@Injectable()
export class GCPStorageProvider implements TUploadProvider {
  private storage: Storage;
  private bucketName: string;

  constructor(
    private envService: TEnvService,
    private logger: ILogger,
  ) {
    this.bucketName =
      this.envService.get('EXTERNAL_GCP_BUCKET_NAME') ?? 'default-bucket';

    // Using ADC - Application Default Credentials
    this.storage = new Storage();

    this.logger.setContextName(GCPStorageProvider.name);
  }

  async uploadFile({
    bucket,
    file,
  }: IUploadProviderUploadFileDto): Promise<Result<IS3UploadResult>> {
    try {
      const fileId = GenerateRandom.id();
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${fileId}.${fileExtension}`;
      const storageId = `${bucket}/${fileName}`;

      this.logger.debug(
        `Upload file payload: ${JSON.stringify({
          key: storageId,
          url: `https://storage.googleapis.com/${this.bucketName}/${storageId}`,
          bucket: this.bucketName as UploadProviderBucketEnum,
          storageId,
          fileId,
        })}`,
      );

      const bucketRef = this.storage.bucket(this.bucketName);
      const fileRef = bucketRef.file(storageId);

      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });

      const result = {
        key: storageId,
        url: `https://storage.googleapis.com/${this.bucketName}/${storageId}`,
        bucket: this.bucketName as UploadProviderBucketEnum,
        storageId,
        fileId,
      };

      return Result.success(result);
    } catch (error) {
      console.trace(error);
      return Result.fail(error as Error);
    }
  }

  async getFileUrl({
    storageId,
  }: IUploadProviderStorageOptions): Promise<Result<IS3GetUrlResult>> {
    try {
      const bucketRef = this.storage.bucket(this.bucketName);
      const fileRef = bucketRef.file(storageId);

      const expiresIn = 3600; // 1 hour in seconds

      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000,
      });

      const result = {
        url,
        expiresIn,
      };

      return Result.success(result);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async downloadFile({
    storageId,
  }: IUploadProviderStorageOptions): Promise<Result<IS3DownloadResult>> {
    try {
      const bucketRef = this.storage.bucket(this.bucketName);
      const fileRef = bucketRef.file(storageId);

      const [contents] = await fileRef.download();

      const fileName = storageId.split('/').pop();
      const extension = fileName?.includes('.')
        ? fileName.split('.').pop()
        : undefined;

      return Result.success({ buffer: contents, extension });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async deleteFile({
    storageId,
  }: IUploadProviderStorageOptions): Promise<Result<void>> {
    try {
      const bucketRef = this.storage.bucket(this.bucketName);
      const fileRef = bucketRef.file(storageId);

      await fileRef.delete();
      return Result.success();
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
