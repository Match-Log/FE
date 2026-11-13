'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { participationApi } from '@/api/participation';
import { useTeamStore } from '@/stores/teamStore';
import GridBackground from '@/components/common/GridBackground';
import { SPECIALIST_ROLES, SPECIALIST_ROLE_INFO, type SpecialistRoleInfo } from '@/constants/specialist';
import { cn, getNameInitials } from '@/lib/utils';
import type { RosterItem, SpecialistRole } from '@/types';

// 역할별로 지정된 participationId. BE 요청도 participationId 기준이다.
type Assignments = Record<SpecialistRole, number | null>;

const EMPTY_ASSIGNMENTS: Assignments = {
  captain: null, pkTaker: null, ckLeft: null, ckRight: null, fkLeft: null, fkRight: null,
};

const CARD_STYLE = { background: 'rgba(18, 20, 32, 0.6)', backdropFilter: 'blur(20px)' };

export default function SpecialistsPage() {
  const router = useRouter();
  const { teamId, role } = useTeamStore();
  const isManager = role === 'MANAGER';

  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [assignments, setAssignments] = useState<Assignments>(EMPTY_ASSIGNMENTS);
  // 로스터에 없는(탈퇴 등) 선수도 이름은 보여주기 위해 서버가 준 이름을 따로 둔다.
  const [slotNames, setSlotNames] = useState<Partial<Record<SpecialistRole, string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pickingRole, setPickingRole] = useState<SpecialistRole | null>(null);

  useEffect(() => {
    if (!teamId) return;
    let cancelled = false;
    Promise.all([participationApi.getTeamPlayers(teamId), participationApi.getRoleAssignment(teamId)])
      .then(([rosterRes, assignRes]) => {
        if (cancelled) return;
        setRoster(rosterRes.data);
        const next = { ...EMPTY_ASSIGNMENTS };
        const names: Partial<Record<SpecialistRole, string>> = {};
        for (const { role: r } of SPECIALIST_ROLES) {
          const slot = assignRes.data[r];
          next[r] = slot?.participationId ?? null;
          if (slot) names[r] = slot.name;
        }
        setAssignments(next);
        setSlotNames(names);
      })
      .catch(() => {
        if (!cancelled) toast.error('전담 선수 정보를 불러오지 못했습니다');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  const findPlayer = (participationId: number | null) =>
    participationId == null ? undefined : roster.find((p) => p.participationId === participationId);

  const openPicker = (r: SpecialistRole) => {
    if (!isManager) {
      toast('전담 선수는 매니저만 지정할 수 있어요');
      return;
    }
    setPickingRole(r);
  };

  const pick = (participationId: number | null) => {
    if (!pickingRole) return;
    setAssignments((prev) => ({ ...prev, [pickingRole]: participationId }));
    setPickingRole(null);
  };

  const save = async () => {
    if (!teamId || !isManager || isSaving) return;
    setIsSaving(true);
    try {
      await participationApi.updateRoleAssignment(teamId, {
        captainParticipationId: assignments.captain,
        pkTakerParticipationId: assignments.pkTaker,
        ckLeftParticipationId: assignments.ckLeft,
        ckRightParticipationId: assignments.ckRight,
        fkLeftParticipationId: assignments.fkLeft,
        fkRightParticipationId: assignments.fkRight,
      });
      toast.success('전담 선수가 저장되었습니다');
      router.push('/squad');
    } catch {
      toast.error('저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const renderName = (r: SpecialistRole) => {
    const pid = assignments[r];
    const player = findPlayer(pid);
    if (pid == null) return { name: '미지정', number: undefined, empty: true };
    return { name: player?.name ?? slotNames[r] ?? '알 수 없음', number: player?.number, empty: false };
  };

  const renderWideCard = (info: SpecialistRoleInfo) => {
    const { name, number, empty } = renderName(info.role);
    const Icon = info.icon;
    return (
      <button
        key={info.role}
        type="button"
        onClick={() => openPicker(info.role)}
        className="w-full p-6 rounded-[1.75rem] border border-white/5 flex items-center gap-5 text-left hover:border-white/15 transition-colors"
        style={CARD_STYLE}
      >
        <div className={cn('w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0', info.box)}>
          <Icon className={cn('w-5 h-5', info.color)} fill={info.filled ? 'currentColor' : 'none'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">{info.label}</p>
          <p className={cn('text-lg font-black truncate', empty ? 'text-zinc-600' : 'text-white')}>
            {name}
            {number != null && <span className="ml-2 text-xs font-black text-zinc-500">#{number}</span>}
          </p>
        </div>
        {isManager && <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />}
      </button>
    );
  };

  const renderTileCard = (info: SpecialistRoleInfo) => {
    const { name, empty } = renderName(info.role);
    const Icon = info.icon;
    return (
      <button
        key={info.role}
        type="button"
        onClick={() => openPicker(info.role)}
        className="p-6 rounded-[1.75rem] border border-white/5 flex flex-col items-center text-center hover:border-white/15 transition-colors min-w-0"
        style={CARD_STYLE}
      >
        <div className={cn('w-14 h-14 rounded-2xl border flex items-center justify-center mb-5', info.box)}>
          <Icon className={cn('w-5 h-5', info.color)} fill={info.filled ? 'currentColor' : 'none'} />
        </div>
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] mb-1">{info.label}</p>
        <p className={cn('text-base font-black truncate max-w-full', empty ? 'text-zinc-600' : 'text-white')}>{name}</p>
      </button>
    );
  };

  const pickingInfo = pickingRole ? SPECIALIST_ROLE_INFO[pickingRole] : null;

  return (
    <div className="min-h-screen bg-[#05060B] text-white">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-[#05060B]/80 backdrop-blur-md z-40 border-b border-white/5">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="w-11 h-11 flex items-center justify-center bg-[#111218] border border-white/5 rounded-xl"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-400" />
        </button>
        <div className="text-center">
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-1">Tactical Config</p>
          <h1 className="text-base font-black uppercase tracking-[0.15em]">Specialists</h1>
        </div>
        <div className="w-11" />
      </header>

      <main className={cn('px-6 pt-10 relative', isManager ? 'pb-44' : 'pb-28')}>
        <GridBackground />

        <div className="relative z-10 mb-10">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Set</h2>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-tight accent-gradient-text">
            Kickers
          </h2>
          <p className="text-[11px] font-bold text-zinc-500 mt-3">
            {isManager ? '세트피스 상황별 전담 선수를 지정하세요.' : '보기 전용 · 매니저만 지정할 수 있어요.'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="relative z-10 space-y-4">
            {renderWideCard(SPECIALIST_ROLE_INFO.captain)}
            {renderWideCard(SPECIALIST_ROLE_INFO.pkTaker)}
            <div className="grid grid-cols-2 gap-4">
              {renderTileCard(SPECIALIST_ROLE_INFO.ckLeft)}
              {renderTileCard(SPECIALIST_ROLE_INFO.ckRight)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderTileCard(SPECIALIST_ROLE_INFO.fkLeft)}
              {renderTileCard(SPECIALIST_ROLE_INFO.fkRight)}
            </div>
          </div>
        )}
      </main>

      {/* Save (하단 메뉴 위에 고정) */}
      {isManager && !isLoading && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-6 pb-4 z-40">
          <button
            type="button"
            onClick={save}
            disabled={isSaving}
            className="w-full py-5 accent-gradient text-black font-black text-sm uppercase tracking-[0.25em] rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,245,255,0.25)] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4" strokeWidth={3} />
            {isSaving ? '저장 중...' : 'Save Specialists'}
          </button>
        </div>
      )}

      {/* Player picker */}
      {pickingInfo && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0 bg-black/70 animate-in fade-in duration-200"
            onClick={() => setPickingRole(null)}
          />
          <div className="relative w-full max-w-md max-h-[75vh] flex flex-col bg-[#0C0D14] border-t border-white/10 rounded-t-[2rem] animate-in slide-in-from-bottom duration-200">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center', pickingInfo.box)}>
                  <pickingInfo.icon className={cn('w-4 h-4', pickingInfo.color)} />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.15em]">{pickingInfo.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setPickingRole(null)}
                aria-label="닫기"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#111218] border border-white/5"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            <ul className="overflow-y-auto px-4 py-3 pb-8">
              <li>
                <button
                  type="button"
                  onClick={() => pick(null)}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5"
                >
                  <span className="text-sm font-black text-zinc-500">지정 안 함</span>
                  {assignments[pickingInfo.role] == null && <Check className="w-4 h-4 text-[#00F5FF]" />}
                </button>
              </li>
              {roster.map((p) => {
                const selected = assignments[pickingInfo.role] === p.participationId;
                return (
                  <li key={p.participationId}>
                    <button
                      type="button"
                      onClick={() => pick(p.participationId)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5',
                        selected && 'bg-[#00F5FF]/5'
                      )}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-full bg-zinc-900 border border-[#00F5FF]/15 flex items-center justify-center text-[10px] font-black text-[#00F5FF] shrink-0">
                          {getNameInitials(p.name)}
                        </span>
                        <span className={cn('text-sm font-black truncate', selected ? 'text-[#00F5FF]' : 'text-white')}>
                          {p.name}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest shrink-0">
                          {[p.number != null ? `#${p.number}` : null, p.mainPosition].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      {selected && <Check className="w-4 h-4 text-[#00F5FF] shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
