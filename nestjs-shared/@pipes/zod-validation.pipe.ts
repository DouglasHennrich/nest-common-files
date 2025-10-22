import { HttpStatus, PipeTransform } from '@nestjs/common';
import { ZodError, ZodSchema, ZodIssue } from 'zod';
import { DefaultException } from '../errors/abstract-application-exception';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform<T>(value: unknown): T {
    try {
      return this.schema.parse(value) as T;
    } catch (exception) {
      if (exception instanceof ZodError) {
        const statusCode = HttpStatus.BAD_REQUEST;
        const errorName = 'ValidationError';

        // Flatten Zod validation errors, including nested union errors
        const flattenZodIssues = (
          issues: ZodIssue[],
          inputValue?: unknown,
        ): {
          field: string;
          message: string;
          code: string;
          received?: unknown;
        }[] => {
          const result: {
            field: string;
            message: string;
            code: string;
            received?: unknown;
          }[] = [];
          for (const issue of issues) {
            if (issue.code === 'invalid_union' && (issue as any).errors) {
              for (const subErrors of (issue as any).errors) {
                result.push(
                  ...flattenZodIssues(subErrors as ZodIssue[], inputValue),
                );
              }
            } else {
              const fieldPath =
                issue.path.length > 0 ? issue.path.join('.') : 'root';
              let receivedValue: unknown = undefined;

              if (
                inputValue &&
                typeof inputValue === 'object' &&
                inputValue !== null
              ) {
                // Try different ways to access the field value
                receivedValue =
                  (inputValue as any)[fieldPath] ||
                  (inputValue as any)[issue.path[0]] ||
                  (issue.path.length > 0
                    ? (inputValue as any)[issue.path[0]]
                    : inputValue);
              } else {
                receivedValue = inputValue;
              }

              result.push({
                field: fieldPath,
                message: issue.message,
                code: issue.code,
                received: receivedValue,
              });
            }
          }
          return result;
        };

        const validationErrors = flattenZodIssues(exception.issues, value);

        const message =
          validationErrors.length === 1
            ? `Validation failed for field '${validationErrors[0].field}': ${validationErrors[0].message}${
                validationErrors[0].received !== undefined
                  ? ` (received: ${JSON.stringify(validationErrors[0].received)})`
                  : ''
              }`
            : `Validation failed: ${validationErrors
                .map(
                  (e) =>
                    `field '${e.field}' - ${e.message}${
                      e.received !== undefined
                        ? ` (received: ${JSON.stringify(e.received)})`
                        : ''
                    }`,
                )
                .join('; ')}`;

        throw new DefaultException(message, errorName, statusCode);
      }

      // For other types of errors, create a generic ZodError
      throw new ZodError([
        {
          code: 'custom',
          path: [],
          message: 'Validation failed',
        },
      ]);
    }
  }
}
