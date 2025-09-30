import z from 'zod';

export const stringToBooleanSchema = z.union([
  z.string().transform((value) => value === 'true' || value === '1'),
  z.boolean(),
]);

export const stringToNumberSchema = z.union([
  z.string().transform((value) => {
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }),
  z.number(),
]);

export const stringToArraySchema = z.union([
  z.string().transform((value: string) => {
    try {
      return JSON.parse(value) as unknown[];
    } catch {
      return undefined;
    }
  }),
  z.array(z.any()),
]);

export const stringToTypedArraySchema = <T>(itemSchema: z.ZodSchema<T>) =>
  z.preprocess((value) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed as unknown[];
        } else {
          return [parsed as unknown];
        }
      } catch {
        return [value as unknown];
      }
    } else if (Array.isArray(value)) {
      return value as unknown[];
    } else {
      return [value];
    }
  }, z.array(itemSchema));
