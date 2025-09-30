import { z } from 'zod';

export const loginDtoBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type TLoginDtoBodySchema = z.infer<typeof loginDtoBodySchema>;
