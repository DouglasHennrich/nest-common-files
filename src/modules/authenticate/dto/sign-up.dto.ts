import { z } from 'zod';
import { ProfessionalTypeEnum } from '@/modules/professionals/models/professional.struct';
import { documentSchema } from '@/@shared/schemas/document.schema';

export const signUpDtoBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  document: documentSchema,
  phone: z.string(),
  area: z.nativeEnum(ProfessionalTypeEnum),
  gender: z.enum(['F', 'M']),
});

export type TSignUpDtoBodySchema = z.infer<typeof signUpDtoBodySchema>;
