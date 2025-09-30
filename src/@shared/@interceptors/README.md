# File Validation Interceptor for Dynamic Multifile Uploading

## Overview

I've created several approaches to handle dynamic multifile uploading with validation. Here are the solutions:

## 1. Enhanced File Validation Interceptor

**File**: `enhanced-file-validation.interceptor.ts`

This is a comprehensive solution that supports:
- Field-specific validation rules
- Dynamic field names
- Multiple files per field
- File size validation
- MIME type validation per field

### Usage Examples:

```typescript
// Strict field validation
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'originalFile', maxCount: 1 },
    { name: 'csv', maxCount: 1 },
  ]),
  new EnhancedFileValidationInterceptor({
    rules: [
      {
        fieldName: 'originalFile',
        allowedMimeTypes: [AllowedMimeTypesEnum.XLS, AllowedMimeTypesEnum.XLSX],
        maxSize: FileValidationFileSize['10MB'],
        isRequired: true,
        maxCount: 1,
      },
      {
        fieldName: 'csv',
        allowedMimeTypes: [AllowedMimeTypesEnum.CSV],
        maxSize: FileValidationFileSize['5MB'],
        isRequired: true,
        maxCount: 1,
      },
    ],
    allowDynamicFields: false,
  }),
)
```

```typescript
// Dynamic fields allowed
@UseInterceptors(
  FileFieldsInterceptor([]),
  new EnhancedFileValidationInterceptor({
    allowDynamicFields: true,
    defaultAllowedMimeTypes: [AllowedMimeTypesEnum.CSV, AllowedMimeTypesEnum.XLSX],
    defaultMaxSize: FileValidationFileSize['10MB'],
    validateAllFiles: true,
  }),
)
```

## 2. Multi-File Validation Interceptor (Simpler)

**File**: `multi-file-validation.interceptor.ts`

This is a simpler solution that extends your current approach:
- Backward compatible with existing code
- Field-specific validation rules
- Better error messages

### Usage in your current controller:

```typescript
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'originalFile', maxCount: 1 },
    { name: 'csv', maxCount: 1 },
  ], {
    limits: { fileSize: FileValidationFileSize['10MB'] },
  }),
  new MultiFileValidationInterceptor([
    {
      fieldName: 'originalFile',
      allowedMimeTypes: [AllowedMimeTypesEnum.XLS, AllowedMimeTypesEnum.XLSX],
      isRequired: true,
      maxCount: 1,
    },
    {
      fieldName: 'csv',
      allowedMimeTypes: [AllowedMimeTypesEnum.CSV],
      isRequired: true,
      maxCount: 1,
    },
  ]),
)
```

## 3. Modifying Your Existing Interceptor

You can also modify your existing `FileValidationInterceptor` to handle multiple files:

```typescript
@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  constructor(
    private readonly allowedMimeTypes: AllowedMimeTypesEnum[] = [/*...*/],
    private readonly isRequired: boolean = true,
    private readonly fieldRules?: { [fieldName: string]: AllowedMimeTypesEnum[] },
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const files = request.files || {};

    if (Array.isArray(files)) {
      // Handle FilesInterceptor
      for (const file of files) {
        this.validateFile(file, this.allowedMimeTypes);
      }
    } else {
      // Handle FileFieldsInterceptor
      for (const [fieldName, fieldFiles] of Object.entries(files)) {
        const allowedTypes = this.fieldRules?.[fieldName] || this.allowedMimeTypes;
        
        if (Array.isArray(fieldFiles)) {
          for (const file of fieldFiles) {
            this.validateFile(file, allowedTypes, fieldName);
          }
        }
      }
    }

    return next.handle();
  }

  private validateFile(file: any, allowedTypes: AllowedMimeTypesEnum[], fieldName?: string) {
    // Your existing validation logic with field context
  }
}
```

## 4. For Completely Dynamic Field Names

If you need completely dynamic field names (not known at compile time), use this approach:

```typescript
@Post('dynamic-upload')
@UseInterceptors(
  FileFieldsInterceptor([]), // Empty array allows any field names
  new EnhancedFileValidationInterceptor({
    allowDynamicFields: true,
    defaultAllowedMimeTypes: [AllowedMimeTypesEnum.CSV, AllowedMimeTypesEnum.XLSX],
    validateAllFiles: true,
  }),
)
async handleDynamicUpload(
  @UploadedFiles() files: { [fieldName: string]: Express.Multer.File[] },
) {
  // Process files dynamically
  Object.entries(files).forEach(([fieldName, fileArray]) => {
    console.log(`Field: ${fieldName}, Files: ${fileArray.length}`);
  });
}
```

## Recommendations

1. **For your current use case**: Use the `MultiFileValidationInterceptor` as it's simpler and maintains backward compatibility.

2. **For future complex scenarios**: Use the `EnhancedFileValidationInterceptor` which provides more features.

3. **For gradual migration**: Modify your existing interceptor to handle the files object structure.

The key insight is that `FileFieldsInterceptor` provides `request.files` as an object with field names as keys, so your interceptor needs to iterate through this structure rather than expecting a single file.