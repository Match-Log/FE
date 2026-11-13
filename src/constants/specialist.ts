import { Crown, Target, CornerUpRight, CornerRightDown, Zap, type LucideIcon } from 'lucide-react';
import type { SpecialistRole } from '@/types';

// 주장·세트피스 전담 역할. BE RoleAssignmentResponseDto 필드명과 같은 키를 쓴다.
export interface SpecialistRoleInfo {
  role: SpecialistRole;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  /** 아이콘 색 */
  color: string;
  /** 아이콘 박스 배경·테두리 */
  box: string;
  /** 아이콘 속을 채울지 (왕관·번개) */
  filled: boolean;
}

export const SPECIALIST_ROLES: SpecialistRoleInfo[] = [
  { role: 'captain', filled: true, label: 'Captain', shortLabel: 'Captain', icon: Crown, color: 'text-amber-500', box: 'bg-amber-500/10 border-amber-500/25' },
  { role: 'pkTaker', filled: false, label: 'Penalty Kick', shortLabel: 'Penalty', icon: Target, color: 'text-rose-500', box: 'bg-rose-500/10 border-rose-500/25' },
  { role: 'ckLeft', filled: false, label: 'Left Corner', shortLabel: 'L Corner', icon: CornerUpRight, color: 'text-[#00F5FF]', box: 'bg-cyan-400/10 border-cyan-400/25' },
  { role: 'ckRight', filled: false, label: 'Right Corner', shortLabel: 'R Corner', icon: CornerRightDown, color: 'text-[#00F5FF]', box: 'bg-cyan-400/10 border-cyan-400/25' },
  { role: 'fkLeft', filled: true, label: 'Left Free Kick', shortLabel: 'L Free Kick', icon: Zap, color: 'text-purple-500', box: 'bg-purple-500/10 border-purple-500/25' },
  { role: 'fkRight', filled: true, label: 'Right Free Kick', shortLabel: 'R Free Kick', icon: Zap, color: 'text-purple-500', box: 'bg-purple-500/10 border-purple-500/25' },
];

export const SPECIALIST_ROLE_INFO = Object.fromEntries(
  SPECIALIST_ROLES.map((r) => [r.role, r])
) as Record<SpecialistRole, SpecialistRoleInfo>;
