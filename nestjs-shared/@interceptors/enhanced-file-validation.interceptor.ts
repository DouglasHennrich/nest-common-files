/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as Multer from 'multer';

export enum AllowedMimeTypesEnum {
  CSV = 'text/csv',
  XLS = 'application/vnd.ms-excel',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PDF = 'application/pdf',
  PNG = 'image/png',
  JPG = 'image/jpg',
  JPEG = 'image/jpeg',
}

export const FileValidationFileSize = {
  '2MB': 2 * 1024 * 1024,
  '5MB': 5 * 1024 * 1024,
  '10MB': 10 * 1024 * 1024,
  '20MB': 20 * 1024 * 1024,
  '50MB': 50 * 1024 * 1024,
  '70MB': 70 * 1024 * 1024,
};

export interface IFileValidationRule {
  fieldName: string;
  allowedMimeTypes: AllowedMimeTypesEnum[];
  maxSize?: number;
  isRequired?: boolean;
  maxCount?: number;
}

export interface IFileValidationOptions {
  rules?: IFileValidationRule[];
  defaultAllowedMimeTypes?: AllowedMimeTypesEnum[];
  defaultIsRequired?: boolean;
  defaultMaxSize?: number;
  allowDynamicFields?: boolean;
  validateAllFiles?: boolean;
}

@Injectable()
export class EnhancedFileValidationInterceptor implements NestInterceptor {
  private readonly options: IFileValidationOptions;

  constructor(options: IFileValidationOptions = {}) {
    this.options = {
      defaultAllowedMimeTypes: [
        AllowedMimeTypesEnum.CSV,
        AllowedMimeTypesEnum.XLS,
        AllowedMimeTypesEnum.XLSX,
      ],
      defaultIsRequired: true,
      defaultMaxSize: FileValidationFileSize['10MB'],
      allowDynamicFields: false,
      validateAllFiles: true,
      ...options,
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const files = this.extractFiles(request);

    if (this.options.rules && this.options.rules.length > 0) {
      this.validateWithRules(files);
    } else if (this.options.validateAllFiles) {
      this.validateAllFiles(files);
    }

    return next.handle();
  }

  private extractFiles(request: any): {
    [fieldName: string]: Multer.File[];
  } {
    // Handle both single file and multiple files scenarios
    if (request.files) {
      // FileFieldsInterceptor or FilesInterceptor result
      if (Array.isArray(request.files)) {
        // FilesInterceptor - all files under same field
        return { files: request.files };
      } else {
        // FileFieldsInterceptor - files organized by field name
        return request.files;
      }
    } else if (request.file) {
      // FileInterceptor result
      return { file: [request.file] };
    }

    return {};
  }

  private validateWithRules(files: {
    [fieldName: string]: Multer.File[];
  }): void {
    const rules = this.options.rules!;

    // Validate each rule
    for (const rule of rules) {
      const fieldFiles = files[rule.fieldName] || [];

      // Check if required field is missing
      if (rule.isRequired && fieldFiles.length === 0) {
        throw new BadRequestException(
          `File required for field: ${rule.fieldName}`,
        );
      }

      // Check max count
      if (rule.maxCount && fieldFiles.length > rule.maxCount) {
        throw new BadRequestException(
          `Too many files for field ${rule.fieldName}. Maximum allowed: ${rule.maxCount}`,
        );
      }

      // Validate each file in the field
      for (const file of fieldFiles) {
        this.validateSingleFile(
          file,
          rule.allowedMimeTypes,
          rule.maxSize,
          rule.fieldName,
        );
      }
    }

    // If dynamic fields are not allowed, check for unexpected fields
    if (!this.options.allowDynamicFields) {
      const allowedFields = rules.map((rule) => rule.fieldName);
      const actualFields = Object.keys(files);
      const unexpectedFields = actualFields.filter(
        (field) => !allowedFields.includes(field),
      );

      if (unexpectedFields.length > 0) {
        throw new BadRequestException(
          `Unexpected file fields: ${unexpectedFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}`,
        );
      }
    }
  }

  private validateAllFiles(files: {
    [fieldName: string]: Multer.File[];
  }): void {
    const hasAnyFile = Object.values(files).some(
      (fileArray) => fileArray.length > 0,
    );

    if (this.options.defaultIsRequired && !hasAnyFile) {
      throw new BadRequestException('At least one file is required');
    }

    // Validate all files with default rules
    for (const [fieldName, fileArray] of Object.entries(files)) {
      for (const file of fileArray) {
        this.validateSingleFile(
          file,
          this.options.defaultAllowedMimeTypes!,
          this.options.defaultMaxSize,
          fieldName,
        );
      }
    }
  }

  private validateSingleFile(
    file: Multer.File,
    allowedMimeTypes: AllowedMimeTypesEnum[],
    maxSize?: number,
    fieldName?: string,
  ): void {
    const fieldPrefix = fieldName ? `File in field '${fieldName}': ` : '';

    // Validate mime type
    const allowedMimeTypesValues = allowedMimeTypes.map(
      (type) => type as string,
    );
    if (!allowedMimeTypesValues.includes(file.mimetype)) {
      const allowedTypesString = this.getAllowedTypesString(allowedMimeTypes);
      throw new BadRequestException(
        `${fieldPrefix}File type not allowed. Only ${allowedTypesString} are accepted.`,
      );
    }

    // Validate file size
    if (maxSize && file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      throw new BadRequestException(
        `${fieldPrefix}File size exceeds limit. Maximum allowed: ${maxSizeMB}MB`,
      );
    }
  }

  private getAllowedTypesString(
    allowedMimeTypes: AllowedMimeTypesEnum[],
  ): string {
    const typeNames = allowedMimeTypes.map((type) => {
      switch (type) {
        case AllowedMimeTypesEnum.CSV:
          return 'CSV';
        case AllowedMimeTypesEnum.XLS:
          return 'XLS';
        case AllowedMimeTypesEnum.XLSX:
          return 'XLSX';
        case AllowedMimeTypesEnum.PDF:
          return 'PDF';
        case AllowedMimeTypesEnum.PNG:
          return 'PNG';
        case AllowedMimeTypesEnum.JPG:
        case AllowedMimeTypesEnum.JPEG:
          return 'JPG';
        default:
          return type;
      }
    });

    if (typeNames.length === 1) {
      return typeNames[0];
    }

    if (typeNames.length === 2) {
      return `${typeNames[0]} and ${typeNames[1]}`;
    }

    return `${typeNames.slice(0, -1).join(', ')} and ${typeNames[typeNames.length - 1]}`;
  }
}
