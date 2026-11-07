import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(2, '팀명은 2자 이상이어야 합니다'),
  region: z.string().optional(),
});

export type CreateTeamFormData = z.infer<typeof createTeamSchema>;

export const joinTeamSchema = z.object({
  inviteCode: z.string().min(4, '초대 코드를 입력하세요'),
});

export type JoinTeamFormData = z.infer<typeof joinTeamSchema>;
