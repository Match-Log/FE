import { z } from 'zod';

export const createMatchSchema = z.object({
  matchType: z.enum(['SOCCER', 'FUTSAL']),
  opponentTeam: z.string().min(2, '상대 팀명을 입력하세요'),
  matchDate: z.string().min(1, '경기 날짜를 입력하세요'),
  homeAway: z.enum(['HOME', 'AWAY']),
  location: z.string().min(2, '경기 장소를 입력하세요'),
  memo: z.string().optional(),
});

export type CreateMatchFormData = z.infer<typeof createMatchSchema>;
