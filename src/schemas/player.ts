import { z } from 'zod';
import { POSITIONS } from '@/constants/position';

const PREFERRED_FOOT = ['LEFT', 'RIGHT', 'BOTH'] as const;
const CAREERS = ['AMATEUR', 'MIDDLE_SCHOOL', 'HIGH_SCHOOL', 'UNIVERSITY', 'ACTIVE'] as const;

const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === '' || v === undefined || v === null || isNaN(Number(v)) ? undefined : Number(v)),
    z.number().int().min(min).max(max).optional()
  );

export const registerPlayerSchema = z.object({
  birthDate: z.string().optional(),
  height: optionalInt(100, 250),
  weight: optionalInt(30, 200),
  preferredFoot: z.enum(PREFERRED_FOOT).optional(),
  career: z.enum(CAREERS).optional(),
  preferredPosition: z.enum(POSITIONS).optional(),
  subPosition: z.enum(POSITIONS).optional(),
});

export type RegisterPlayerFormData = z.infer<typeof registerPlayerSchema>;
