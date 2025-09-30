import { z } from 'zod';

export const fileSchema = z.object({
  buffer: z.instanceof(Buffer),
  originalname: z.string(),
  mimetype: z.string(),
  size: z.coerce.number().int().positive(),
});

export type TFileSchema = z.infer<typeof fileSchema>;
