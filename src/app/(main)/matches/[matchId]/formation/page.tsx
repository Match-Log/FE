'use client';

import { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { ChevronDown, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { lineupApi } from '@/api/lineup';
import { participationApi } from '@/api/participation';
import { useTeamStore } from '@/stores/teamStore';
import GridBackground from '@/components/common/GridBackground';
import { cn } from '@/lib/utils';
import type { RosterItem, KickerRole, KickerAssignment, LineupSpot } from '@/types';

// ── Formation definitions ──────────────────────────────────────────────────

type FormationName = '4-3-3' | '4-2-3-1' | '4-4-2' | '3-5-2' | '5-3-2' | '4-1-4-1';

interface SlotDef { id: string; label: string; x: number; y: number }

const FORMATIONS: Record<FormationName, SlotDef[]> = {
  '4-3-3': [
    { id: 'GK', label: 'GK', x: 50, y: 86 },
    { id: 'LB', label: 'LB', x: 14, y: 70 }, { id: 'CB1', label: 'CB', x: 36, y: 73 },
    { id: 'CB2', label: 'CB', x: 64, y: 73 }, { id: 'RB', label: 'RB', x: 86, y: 70 },
    { id: 'LM', label: 'LM', x: 20, y: 50 }, { id: 'CM', label: 'CM', x: 50, y: 52 }, { id: 'RM', label: 'RM', x: 80, y: 50 },
    { id: 'LW', label: 'LW', x: 18, y: 24 }, { id: 'ST', label: 'ST', x: 50, y: 14 }, { id: 'RW', label: 'RW', x: 82, y: 24 },
  ],
  '4-2-3-1': [
    { id: 'GK', label: 'GK', x: 50, y: 86 },
    { id: 'LB', label: 'LB', x: 14, y: 70 }, { id: 'CB1', label: 'CB', x: 36, y: 73 },
    { id: 'CB2', label: 'CB', x: 64, y: 73 }, { id: 'RB', label: 'RB', x: 86, y: 70 },
    { id: 'CDM1', label: 'CDM', x: 35, y: 56 }, { id: 'CDM2', label: 'CDM', x: 65, y: 56 },
    { id: 'LW', label: 'LW', x: 15, y: 34 }, { id: 'CAM', label: 'CAM', x: 50, y: 34 }, { id: 'RW', label: 'RW', x: 85, y: 34 },
    { id: 'ST', label: 'ST', x: 50, y: 14 },
  ],
  '4-4-2': [
    { id: 'GK', label: 'GK', x: 50, y: 86 },
    { id: 'LB', label: 'LB', x: 13, y: 70 }, { id: 'CB1', label: 'CB', x: 36, y: 73 },
    { id: 'CB2', label: 'CB', x: 64, y: 73 }, { id: 'RB', label: 'RB', x: 87, y: 70 },
    { id: 'LM', label: 'LM', x: 12, y: 50 }, { id: 'CM1', label: 'CM', x: 38, y: 52 },
    { id: 'CM2', label: 'CM', x: 62, y: 52 }, { id: 'RM', label: 'RM', x: 88, y: 50 },
    { id: 'ST1', label: 'ST', x: 36, y: 18 }, { id: 'ST2', label: 'ST', x: 64, y: 18 },
  ],
  '3-5-2': [
    { id: 'GK', label: 'GK', x: 50, y: 86 },
    { id: 'CB1', label: 'CB', x: 25, y: 73 }, { id: 'CB2', label: 'CB', x: 50, y: 76 }, { id: 'CB3', label: 'CB', x: 75, y: 73 },
    { id: 'LWB', label: 'LWB', x: 10, y: 52 }, { id: 'CM1', label: 'CM', x: 30, y: 50 },
    { id: 'CM2', label: 'CM', x: 50, y: 52 }, { id: 'CM3', label: 'CM', x: 70, y: 50 }, { id: 'RWB', label: 'RWB', x: 90, y: 52 },
    { id: 'ST1', label: 'ST', x: 36, y: 18 }, { id: 'ST2', label: 'ST', x: 64, y: 18 },
  ],
  '5-3-2': [
    { id: 'GK', label: 'GK', x: 50, y: 86 },
    { id: 'LWB', label: 'LWB', x: 8, y: 70 }, { id: 'LCB', label: 'CB', x: 28, y: 74 },
    { id: 'CB', label: 'CB', x: 50, y: 76 }, { id: 'RCB', label: 'CB', x: 72, y: 74 }, { id: 'RWB', label: 'RWB', x: 92, y: 70 },
    { id: 'LM', label: 'LM', x: 25, y: 50 }, { id: 'CM', label: 'CM', x: 50, y: 52 }, { id: 'RM', label: 'RM', x: 75, y: 50 },
    { id: 'ST1', label: 'ST', x: 36, y: 18 }, { id: 'ST2', label: 'ST', x: 64, y: 18 },
  ],
  '4-1-4-1': [
    { id: 'GK', label: 'GK', x: 50, y: 86 },
    { id: 'LB', label: 'LB', x: 14, y: 70 }, { id: 'CB1', label: 'CB', x: 36, y: 73 },
    { id: 'CB2', label: 'CB', x: 64, y: 73 }, { id: 'RB', label: 'RB', x: 86, y: 70 },
    { id: 'CDM', label: 'CDM', x: 50, y: 60 },
    { id: 'LM', label: 'LM', x: 12, y: 44 }, { id: 'CM1', label: 'CM', x: 37, y: 42 },
    { id: 'CM2', label: 'CM', x: 63, y: 42 }, { id: 'RM', label: 'RM', x: 88, y: 44 },
    { id: 'ST', label: 'ST', x: 50, y: 14 },
  ],
};

const FORMATION_NAMES = Object.keys(FORMATIONS) as FormationName[];

const KICKER_ROLES: { role: KickerRole; label: string; color: string; bg: string }[] = [
  { role: 'CAPTAIN', label: 'Captain', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  { role: 'PENALTY', label: 'Penalty Kick', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' },
  { role: 'LEFT_CORNER', label: 'Left Corner', color: 'text-[#00F5FF]', bg: 'bg-cyan-400/10 border-cyan-400/20' },
  { role: 'RIGHT_CORNER', label: 'Right Corner', color: 'text-[#00F5FF]', bg: 'bg-cyan-400/10 border-cyan-400/20' },
  { role: 'LEFT_FK', label: 'Left Free Kick', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { role: 'RIGHT_FK', label: 'Right Free Kick', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
];

function getInitials(name: string) {
  return name.slice(0, 2);
}

// ── Helpers ────────────────────────────────────────────────────────────────

function isFormationName(v: string): v is FormationName {
  return v in FORMATIONS;
}

// 서버에는 포지션 라벨(예: 'CB')로 저장되므로, 같은 라벨이 여러 개인 자리(CB1, CB2…)에 순서대로 다시 배치한다.
function spotsToAssignments(formation: FormationName, spots: LineupSpot[]): Record<string, number> {
  const map: Record<string, number> = {};
  const used = new Set<string>();
  for (const s of spots) {
    if (s.playerId == null) continue;
    const slot = FORMATIONS[formation].find(
      (d) => !used.has(d.id) && (d.id === s.position || d.label === s.position)
    );
    if (!slot) continue;
    used.add(slot.id);
    map[slot.id] = s.playerId;
  }
  return map;
}

// 이 거리(px) 이상 움직여야 드래그로 본다. 그보다 짧으면 클릭으로 처리.
const DRAG_THRESHOLD = 6;
// (main) 레이아웃의 <main className="pb-20"> 만큼 하단 메뉴 자리를 비워둔다.
const BOTTOM_NAV_SPACE = 80;

interface DragSource {
  playerId: number;
  fromSlotId: string | null; // null = 왼쪽 선수 목록에서 시작
}

interface DragState extends DragSource {
  x: number;
  y: number;
  overSlotId: string | null;
  overRoster: boolean;
}

function findDropTarget(x: number, y: number) {
  const el = document.elementFromPoint(x, y) as HTMLElement | null;
  const slotEl = el?.closest<HTMLElement>('[data-slot-id]');
  return {
    overSlotId: slotEl?.dataset.slotId ?? null,
    overRoster: !!el?.closest('[data-roster-drop]'),
  };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function FormationPage() {
  const params = useParams<{ matchId: string }>();
  const { teamId, role: userRole } = useTeamStore();
  const matchId = Number(params.matchId);
  const isManager = userRole === 'MANAGER';

  const [activeTab, setActiveTab] = useState<'formation' | 'specialists'>('formation');
  const [quarter, setQuarter] = useState<1 | 2 | 3 | 4>(1);
  const [formation, setFormation] = useState<FormationName>('4-3-3');
  const [showFormationDropdown, setShowFormationDropdown] = useState(false);

  // slotAssignments: slotId → playerId
  const [slotAssignments, setSlotAssignments] = useState<Record<string, number>>({});
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const [drag, setDrag] = useState<DragState | null>(null);
  const pendingDragRef = useRef<{ source: DragSource; startX: number; startY: number } | null>(null);
  const isDraggingRef = useRef(false);
  const suppressClickRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);

  const [players, setPlayers] = useState<RosterItem[]>([]);
  const [specialists, setSpecialists] = useState<Record<KickerRole, number | null>>({
    CAPTAIN: null, PENALTY: null, LEFT_CORNER: null, RIGHT_CORNER: null, LEFT_FK: null, RIGHT_FK: null,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load players
  useEffect(() => {
    if (!teamId) return;
    participationApi.getTeamPlayers(teamId).then((r) => setPlayers(r.data)).catch(() => {});
  }, [teamId]);

  // Load lineup for the current quarter
  useEffect(() => {
    let cancelled = false;
    lineupApi.getLineup(matchId).then((r) => {
      if (cancelled) return;
      const lineup = Array.isArray(r.data) ? r.data.find((l) => l.quarter === quarter) : undefined;
      if (lineup) {
        const f = isFormationName(lineup.formation) ? lineup.formation : '4-3-3';
        setFormation(f);
        setSlotAssignments(spotsToAssignments(f, lineup.spots));
      } else {
        setSlotAssignments({});
      }
      setSelectedPlayerId(null);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [quarter, matchId]);

  // 화면 높이를 실제 위치 기준으로 계산해서 하단 메뉴에 경기장이 가려지지 않게 한다.
  useLayoutEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      setContainerHeight(Math.max(360, window.innerHeight - top - BOTTOM_NAV_SPACE));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const slots = FORMATIONS[formation];
  const assignedPlayerIds = new Set(Object.values(slotAssignments));
  const selectedSlotId =
    selectedPlayerId !== null
      ? Object.keys(slotAssignments).find((k) => slotAssignments[k] === selectedPlayerId) ?? null
      : null;

  // 선수를 자리에 놓는다. 한 선수는 한 자리에만 들어가고,
  // 경기장 위 선수를 다른 선수가 있는 자리로 옮기면 서로 자리를 바꾼다.
  const placePlayer = useCallback((playerId: number, targetSlotId: string) => {
    setSlotAssignments((prev) => {
      const fromSlotId = Object.keys(prev).find((k) => prev[k] === playerId) ?? null;
      if (fromSlotId === targetSlotId) return prev;
      const next = { ...prev };
      const occupant = next[targetSlotId];
      if (fromSlotId) delete next[fromSlotId];
      next[targetSlotId] = playerId;
      if (occupant !== undefined && fromSlotId) next[fromSlotId] = occupant;
      return next;
    });
  }, []);

  const removeFromPitch = useCallback((playerId: number) => {
    setSlotAssignments((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) if (next[k] === playerId) delete next[k];
      return next;
    });
  }, []);

  const ensureManager = () => {
    if (isManager) return true;
    toast.info('라인업은 매니저만 편집할 수 있어요');
    return false;
  };

  // 드래그 직후 따라오는 click 이벤트는 무시한다.
  const consumeSuppressedClick = () => {
    if (!suppressClickRef.current) return false;
    suppressClickRef.current = false;
    return true;
  };

  const handlePlayerClick = (playerId: number) => {
    if (consumeSuppressedClick()) return;
    if (!ensureManager()) return;
    setSelectedPlayerId((prev) => (prev === playerId ? null : playerId));
  };

  const handleSlotClick = (slotId: string) => {
    if (consumeSuppressedClick()) return;
    if (!ensureManager()) return;
    const occupant = slotAssignments[slotId];
    if (selectedPlayerId !== null) {
      if (occupant === selectedPlayerId) {
        // 선택한 선수의 자리를 한 번 더 누르면 경기장에서 뺀다.
        removeFromPitch(selectedPlayerId);
      } else {
        placePlayer(selectedPlayerId, slotId);
      }
      setSelectedPlayerId(null);
      return;
    }
    // 아무도 선택하지 않은 상태에서 선수가 있는 자리를 누르면 그 선수를 선택한다.
    if (occupant !== undefined) setSelectedPlayerId(occupant);
  };

  const handlePointerDown = (e: React.PointerEvent, source: DragSource) => {
    if (!isManager) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pendingDragRef.current = { source, startX: e.clientX, startY: e.clientY };
  };

  // Pointer drag (mouse + touch)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const pending = pendingDragRef.current;
      if (!pending) return;
      if (!isDraggingRef.current) {
        const dist = Math.hypot(e.clientX - pending.startX, e.clientY - pending.startY);
        if (dist < DRAG_THRESHOLD) return;
        isDraggingRef.current = true;
      }
      setDrag({ ...pending.source, x: e.clientX, y: e.clientY, ...findDropTarget(e.clientX, e.clientY) });
    };

    const reset = () => {
      pendingDragRef.current = null;
      isDraggingRef.current = false;
      setDrag(null);
    };

    const onUp = (e: PointerEvent) => {
      const pending = pendingDragRef.current;
      const wasDragging = isDraggingRef.current;
      reset();
      if (!pending || !wasDragging) return;

      const { overSlotId, overRoster } = findDropTarget(e.clientX, e.clientY);
      if (overSlotId) placePlayer(pending.source.playerId, overSlotId);
      else if (overRoster && pending.source.fromSlotId) removeFromPitch(pending.source.playerId);
      setSelectedPlayerId(null);

      suppressClickRef.current = true;
      setTimeout(() => { suppressClickRef.current = false; }, 0);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', reset);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', reset);
    };
  }, [placePlayer, removeFromPitch]);

  const posToCategory = (pos?: string): 'DF' | 'MF' | 'FW' => {
    if (!pos) return 'FW';
    if (['CB', 'LB', 'RB', 'WB'].includes(pos)) return 'DF';
    if (['CDM', 'CM', 'LM', 'RM', 'CAM', 'AM'].includes(pos)) return 'MF';
    return 'FW';
  };

  const autoFormation = useCallback(() => {
    if (!isManager) return;
    const newMap: Record<string, number> = {};
    const byPos: Record<string, RosterItem[]> = { DF: [], MF: [], FW: [] };
    players.forEach((p) => byPos[posToCategory(p.mainPosition)]?.push(p));

    const slotList = FORMATIONS[formation];
    const defSlots = slotList.filter((s) => ['LB', 'CB', 'RB', 'LCB', 'RCB', 'LWB', 'RWB'].includes(s.label));
    const midSlots = slotList.filter((s) => ['LM', 'CM', 'RM', 'CDM', 'CAM', 'CM1', 'CM2', 'CM3', 'CDM1', 'CDM2'].includes(s.label));
    const fwdSlots = slotList.filter((s) => ['ST', 'LW', 'RW', 'ST1', 'ST2'].includes(s.label));

    [[defSlots, byPos.DF], [midSlots, byPos.MF], [fwdSlots, byPos.FW]].forEach(([ss, pp]) => {
      const slotsArr = ss as SlotDef[];
      const pArr = pp as RosterItem[];
      slotsArr.forEach((slot, i) => {
        if (pArr[i]) newMap[slot.id] = pArr[i].playerId;
      });
    });
    setSlotAssignments(newMap);
    toast.success('포메이션이 자동 배치되었습니다');
  }, [formation, players, isManager]);

  const saveLineup = async () => {
    if (!isManager) return;
    setIsSaving(true);
    try {
      const spots = Object.entries(slotAssignments).map(([slotId, playerId]) => {
        const slotDef = slots.find((s) => s.id === slotId)!;
        return { playerId, position: slotDef.label, isStarter: true };
      });
      await lineupApi.saveLineup(matchId, { quarter, formation, spots });
      toast.success('라인업이 저장되었습니다');
    } catch {
      toast.error('저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const roleToAssignment = (role: KickerRole): KickerAssignment => {
    switch (role) {
      case 'CAPTAIN':      return { isCaptain: true };
      case 'PENALTY':      return { isPkTaker: true };
      case 'LEFT_CORNER':  return { isCkLeft: true };
      case 'RIGHT_CORNER': return { isCkRight: true };
      case 'LEFT_FK':      return { isFkLeft: true };
      case 'RIGHT_FK':     return { isFkRight: true };
    }
  };

  const saveSpecialists = async () => {
    if (!isManager || !teamId) return;
    setIsSaving(true);
    try {
      await Promise.all(
        (Object.entries(specialists) as [KickerRole, number | null][])
          .filter(([, pid]) => pid !== null)
          .map(([role, pid]) => participationApi.setKicker(teamId, pid!, roleToAssignment(role)))
      );
      toast.success('스페셜리스트가 저장되었습니다');
    } catch {
      toast.error('저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const hintText = !isManager
    ? '보기 전용 · 매니저만 편집 가능'
    : drag
    ? '놓을 자리로 끌어다 놓으세요'
    : selectedSlotId
    ? '다른 자리: 이동/교체 · 같은 자리: 빼기'
    : selectedPlayerId !== null
    ? '놓을 자리를 누르세요'
    : '선수를 누르거나 끌어서 배치하세요';

  const draggedPlayer = drag ? players.find((p) => p.playerId === drag.playerId) : undefined;

  return (
    <div
      ref={containerRef}
      className="flex flex-col overflow-hidden bg-[#05060B] text-white"
      style={{ height: containerHeight ?? 'calc(100dvh - 214px)' }}
    >
      {/* ── Inner tabs ── */}
      <div className="shrink-0 flex border-b border-white/5 bg-[#05060B]">
        {(['formation', 'specialists'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              'flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t ? 'text-[#00F5FF] border-b-2 border-[#00F5FF]' : 'text-zinc-600'
            )}
          >
            {t === 'formation' ? 'Formation' : 'Specialists'}
          </button>
        ))}
      </div>

      <div className="flex flex-1 min-h-0">
      {/* ── Left sidebar (경기장 선수를 여기로 끌어오면 빠짐) ── */}
      <aside
        data-roster-drop
        className={cn(
          'w-[72px] border-r bg-[#05060B]/50 flex flex-col pt-3 z-10 overflow-hidden select-none transition-colors',
          drag?.fromSlotId && drag.overRoster ? 'border-rose-500/60 bg-rose-500/5' : 'border-white/5'
        )}
      >
        {/* Quarter buttons */}
        <div className="px-2 mb-4">
          <span className="block text-[7px] font-black text-zinc-700 uppercase tracking-[0.2em] mb-2 text-center">QTR</span>
          <div className="grid grid-cols-2 gap-1">
            {([1, 2, 3, 4] as const).map((q) => (
              <button
                key={q}
                onClick={() => setQuarter(q)}
                className={cn(
                  'aspect-square rounded-md text-[10px] font-black transition-all',
                  quarter === q
                    ? 'bg-[#00F5FF] text-black shadow-[0_0_15px_rgba(0,245,255,0.3)]'
                    : 'bg-[#0A0B14] border border-white/5 text-zinc-600'
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="px-2 mb-2">
          <span className="block text-[7px] font-black text-zinc-700 uppercase tracking-[0.2em] text-center">Squad</span>
        </div>

        {/* Player list */}
        <div className="flex-1 overflow-y-auto pb-6 px-1 space-y-3">
          {players.map((p) => {
            const isPlaced = assignedPlayerIds.has(p.playerId);
            const isSelected = selectedPlayerId === p.playerId;
            const isDragged = drag?.playerId === p.playerId;
            return (
              <div
                key={p.playerId}
                className={cn(
                  'flex flex-col items-center gap-1 touch-pan-y',
                  isManager ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                  isDragged && 'opacity-40'
                )}
                onPointerDown={(e) => handlePointerDown(e, { playerId: p.playerId, fromSlotId: null })}
                onClick={() => handlePlayerClick(p.playerId)}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-[9px] font-black transition-all',
                    isSelected
                      ? 'bg-[#00F5FF] text-black ring-2 ring-[#00F5FF] ring-offset-2 ring-offset-[#05060B]'
                      : isPlaced
                      ? 'bg-[#00F5FF]/20 border border-[#00F5FF] text-white'
                      : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:border-[#00F5FF]/40'
                  )}
                >
                  {getInitials(p.name)}
                </div>
                <span className={cn('text-[7px] font-black uppercase', isPlaced ? 'text-[#00F5FF]' : 'text-zinc-600')}>
                  {p.mainPosition}
                </span>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Right area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Formation tab */}
        {activeTab === 'formation' && (
          <div className="flex-1 flex flex-col p-3 overflow-hidden">
            {/* Formation selector */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="relative shrink-0">
                <button
                  onClick={() => isManager && setShowFormationDropdown((v) => !v)}
                  className="bg-zinc-900 border border-white/5 px-3 py-2 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-tight"
                >
                  <span className="text-[#00F5FF]">{formation}</span>
                  {isManager && <ChevronDown className="w-3 h-3 text-zinc-600" />}
                </button>
                {showFormationDropdown && (
                  <div className="absolute top-full mt-1 left-0 bg-[#111218] border border-white/10 rounded-xl z-30 overflow-hidden min-w-[120px] shadow-2xl">
                    {FORMATION_NAMES.map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          setFormation(f);
                          setShowFormationDropdown(false);
                          setSlotAssignments({});
                          setSelectedPlayerId(null);
                        }}
                        className={cn(
                          'w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-tight hover:bg-white/5 transition-colors',
                          f === formation ? 'text-[#00F5FF]' : 'text-zinc-400'
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span
                className={cn(
                  'text-[9px] font-black text-right truncate',
                  selectedPlayerId !== null || drag ? 'text-[#00F5FF] animate-pulse' : 'text-zinc-600'
                )}
              >
                {hintText}
              </span>
            </div>

            {/* Pitch */}
            <div className="flex-1 relative bg-[#0A0B14] border border-[#00F5FF]/10 rounded-xl overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] select-none">
              <GridBackground />
              {/* Pitch markings */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-x-4 top-1/2 h-px bg-white/30 -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/20 rounded-full" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[48%] h-14 border border-white/20 border-t-0" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[48%] h-14 border border-white/20 border-b-0" />
              </div>

              {/* Position slots */}
              {slots.map((slot) => {
                const assignedPid = slotAssignments[slot.id];
                const assignedPlayer = players.find((p) => p.playerId === assignedPid);
                const isEmpty = !assignedPlayer;
                const isDropTarget = drag?.overSlotId === slot.id;
                const isDragSource = drag?.fromSlotId === slot.id;
                const isSelectedSlot = selectedSlotId === slot.id;

                return (
                  <div
                    key={slot.id}
                    data-slot-id={slot.id}
                    className={cn(
                      'absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 z-10 p-1',
                      !isEmpty && isManager && 'touch-none'
                    )}
                    style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                    onPointerDown={
                      assignedPlayer
                        ? (e) => handlePointerDown(e, { playerId: assignedPlayer.playerId, fromSlotId: slot.id })
                        : undefined
                    }
                    onClick={() => handleSlotClick(slot.id)}
                  >
                    {isEmpty ? (
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full border border-dashed flex items-center justify-center cursor-pointer transition-all',
                          isDropTarget || (selectedPlayerId !== null && isManager)
                            ? 'bg-[#00F5FF]/15 border-[#00F5FF]'
                            : 'bg-[#00F5FF]/5 border-[#00F5FF]/40 hover:bg-[#00F5FF]/10 hover:border-[#00F5FF]/70',
                          isDropTarget && 'scale-125'
                        )}
                      >
                        <span className="text-[#00F5FF]/40 text-lg leading-none">+</span>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full bg-[#00F5FF] flex items-center justify-center text-[8px] font-black text-black shadow-[0_0_10px_rgba(0,245,255,0.4)] transition-all',
                          isManager ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                          isSelectedSlot && 'ring-2 ring-white ring-offset-2 ring-offset-[#0A0B14]',
                          isDropTarget && 'scale-125 ring-2 ring-white',
                          isDragSource && 'opacity-30'
                        )}
                      >
                        {getInitials(assignedPlayer.name)}
                      </div>
                    )}
                    <span className={cn('text-[7px] font-black uppercase tracking-widest', isEmpty ? 'text-zinc-600' : 'text-zinc-400')}>
                      {slot.label}
                    </span>
                  </div>
                );
              })}

              {/* Auto Formation + Save button */}
              {isManager && (
                <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-20">
                  <button
                    onClick={autoFormation}
                    className="bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all hover:border-[#00F5FF]/30"
                  >
                    <Wand2 className="w-3 h-3 text-[#00F5FF]" />
                    Auto
                  </button>
                  <button
                    onClick={saveLineup}
                    disabled={isSaving}
                    className="bg-[#00F5FF] text-black px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)] disabled:opacity-50"
                  >
                    {isSaving ? '...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Specialists tab */}
        {activeTab === 'specialists' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1 mb-4">Set-Piece Takers</p>

            {/* Captain + Penalty (full width) */}
            {KICKER_ROLES.slice(0, 2).map(({ role, label, color, bg }) => (
              <div key={role} className={cn('p-4 rounded-2xl border bg-zinc-900/40 flex items-center gap-4', bg)}>
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border', bg, 'shrink-0')}>
                  <span className={cn('text-xs font-black', color)}>
                    {role === 'CAPTAIN' ? 'C' : 'PK'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
                  {isManager ? (
                    <select
                      value={specialists[role] ?? ''}
                      onChange={(e) => setSpecialists((prev) => ({ ...prev, [role]: e.target.value ? Number(e.target.value) : null }))}
                      className="bg-transparent text-[11px] font-black uppercase outline-none text-white w-full"
                    >
                      <option value="">미지정</option>
                      {players.map((p) => (
                        <option key={p.playerId} value={p.playerId} className="bg-[#111218] text-white">
                          {p.name} ({p.mainPosition})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[11px] font-black uppercase">
                      {players.find((p) => p.playerId === specialists[role])?.name ?? '미지정'}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Corner (2-col) */}
            <div className="grid grid-cols-2 gap-3">
              {KICKER_ROLES.slice(2, 4).map(({ role, label, color, bg }) => (
                <div key={role} className={cn('p-4 rounded-2xl border bg-zinc-900/40', bg)}>
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center border mb-3', bg)}>
                    <span className={cn('text-[9px] font-black', color)}>
                      {role === 'LEFT_CORNER' ? 'L' : 'R'}
                    </span>
                  </div>
                  <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
                  {isManager ? (
                    <select
                      value={specialists[role] ?? ''}
                      onChange={(e) => setSpecialists((prev) => ({ ...prev, [role]: e.target.value ? Number(e.target.value) : null }))}
                      className="bg-transparent text-[10px] font-black uppercase outline-none text-white w-full"
                    >
                      <option value="">미지정</option>
                      {players.map((p) => (
                        <option key={p.playerId} value={p.playerId} className="bg-[#111218] text-white">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[10px] font-black uppercase truncate">
                      {players.find((p) => p.playerId === specialists[role])?.name ?? '미지정'}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Free Kick (2-col) */}
            <div className="grid grid-cols-2 gap-3">
              {KICKER_ROLES.slice(4, 6).map(({ role, label, color, bg }) => (
                <div key={role} className={cn('p-4 rounded-2xl border bg-zinc-900/40', bg)}>
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center border mb-3', bg)}>
                    <span className={cn('text-[9px] font-black', color)}>FK</span>
                  </div>
                  <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
                  {isManager ? (
                    <select
                      value={specialists[role] ?? ''}
                      onChange={(e) => setSpecialists((prev) => ({ ...prev, [role]: e.target.value ? Number(e.target.value) : null }))}
                      className="bg-transparent text-[10px] font-black uppercase outline-none text-white w-full"
                    >
                      <option value="">미지정</option>
                      {players.map((p) => (
                        <option key={p.playerId} value={p.playerId} className="bg-[#111218] text-white">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[10px] font-black uppercase truncate">
                      {players.find((p) => p.playerId === specialists[role])?.name ?? '미지정'}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {isManager && (
              <button
                onClick={saveSpecialists}
                disabled={isSaving}
                className="w-full py-4 mt-4 accent-gradient text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSaving ? '저장 중...' : 'Save Specialists'}
              </button>
            )}
          </div>
        )}
      </div>
      </div>

      {/* Drag ghost */}
      {drag && draggedPlayer && (
        <div
          className="fixed z-[60] pointer-events-none -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#00F5FF] text-black flex items-center justify-center text-[9px] font-black shadow-[0_0_20px_rgba(0,245,255,0.6)]"
          style={{ left: drag.x, top: drag.y }}
        >
          {getInitials(draggedPlayer.name)}
        </div>
      )}
    </div>
  );
}
