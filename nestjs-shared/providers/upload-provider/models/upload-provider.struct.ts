import { Result } from '../classes/result';

export enum UploadProviderBucketEnum {
  BULK_CLASSIFICATIONS = 'BULK-CLASSIFICATIONS',
}

export interface IUploadProviderStorageOptions {
  storageId: string;
}

export interface IS3UploadResult {
  key: string;
  url: string;
  bucket: UploadProviderBucketEnum;
  storageId: string;
  fileId: string;
}

export interface IS3GetUrlResult {
  url: string;
  expiresIn?: number;
}

export interface IS3DownloadResult {
  buffer: Buffer;
  extension?: string;
}

export interface IUploadProviderUploadFileDto {
  bucket: UploadProviderBucketEnum;
  file: {
    buffer: Buffer<ArrayBufferLike>;
    originalname: string;
    mimetype: string;
    size: number;
  };
}

export abstract class TUploadProvider {
  abstract uploadFile(
    dto: IUploadProviderUploadFileDto,
  ): Promise<Result<IS3UploadResult>>;

  abstract getFileUrl(
    payload: IUploadProviderStorageOptions,
  ): Promise<Result<IS3GetUrlResult>>;

  abstract downloadFile({
    storageId,
  }: IUploadProviderStorageOptions): Promise<Result<IS3DownloadResult>>;

  abstract deleteFile(
    payload: IUploadProviderStorageOptions,
  ): Promise<Result<void>>;
}
