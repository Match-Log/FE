import { z } from 'zod';

const POSITIONS = ['GK', 'DF', 'MF', 'FW'] as const;

export const registerPlayerSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  number: z
    .number()
    .int()
    .min(1, '1 이상의 숫자를 입력하세요')
    .max(99, '99 이하의 숫자를 입력하세요'),
  mainPosition: z.enum(POSITIONS),
  subPositions: z.array(z.enum(POSITIONS)),
});

export type RegisterPlayerFormData = z.infer<typeof registerPlayerSchema>;
