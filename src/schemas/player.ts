import { z } from 'zod';

const POSITIONS = [
  'CB', 'LB', 'RB', 'WB',
  'CDM', 'CM', 'LM', 'RM', 'CAM', 'AM',
  'LW', 'RW', 'ST', 'CF',
] as const;
const PREFERRED_FOOT = ['LEFT', 'RIGHT', 'BOTH'] as const;

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
  career: z.string().optional(),
  preferredPosition: z.enum(POSITIONS).optional(),
  subPosition: z.enum(POSITIONS).optional(),
});

export type RegisterPlayerFormData = z.infer<typeof registerPlayerSchema>;
