import { z } from 'zod';

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

const currentYear = new Date().getFullYear();

export const createTeamSchema = z.object({
  name: z.string().min(2, '팀명은 2자 이상이어야 합니다'),
  teamImage: z.preprocess(
    emptyToUndefined,
    z.string().url('올바른 이미지 URL을 입력하세요').optional()
  ),
  region: z.preprocess(emptyToUndefined, z.string().optional()),
  foundedYear: z.preprocess(
    (v) => (v === '' || v === null || v === undefined || Number.isNaN(v) ? undefined : Number(v)),
    z
      .number({ error: '숫자로 입력하세요' })
      .int('연도는 정수로 입력하세요')
      .min(1900, '1900년 이후로 입력하세요')
      .max(currentYear, `${currentYear}년 이전으로 입력하세요`)
      .optional()
  ),
  homeGround: z.preprocess(emptyToUndefined, z.string().optional()),
});

export type CreateTeamFormInput = z.input<typeof createTeamSchema>;
export type CreateTeamFormData = z.output<typeof createTeamSchema>;

export const joinTeamSchema = z.object({
  inviteCode: z.string().min(4, '초대 코드를 입력하세요'),
});

export type JoinTeamFormData = z.infer<typeof joinTeamSchema>;
