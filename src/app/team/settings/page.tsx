'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Copy, Check, Pencil, X, Users, Shield, ShieldOff, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { teamApi } from '@/api/team';
import { participationApi } from '@/api/participation';
import { useTeamStore } from '@/stores/teamStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { TeamDetail, RosterItem } from '@/types';

const getErrorStatus = (err: unknown) =>
  (err as { response?: { status?: number } })?.response?.status;

// 매니저 먼저, 같은 역할 안에서는 이름순
const sortMembers = (list: RosterItem[]) =>
  [...list].sort((a, b) => {
    if (a.role !== b.role) return a.role === 'MANAGER' ? -1 : 1;
    return a.name.localeCompare(b.name, 'ko');
  });

export default function TeamSettingsPage() {
  const router = useRouter();
  const { teamId, role, playerId, setTeam } = useTeamStore();
  const isManager = role === 'MANAGER';

  const [team, setTeamData] = useState<TeamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Invite code
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Inline edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Role management (MANAGER only)
  const [members, setMembers] = useState<RosterItem[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [roleTarget, setRoleTarget] = useState<RosterItem | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const managerCount = members.filter((m) => m.role === 'MANAGER').length;

  const loadMembers = async () => {
    if (!teamId) return [];
    const res = await participationApi.getTeamPlayers(teamId);
    const sorted = sortMembers(res.data);
    setMembers(sorted);
    return sorted;
  };

  useEffect(() => {
    if (!teamId || !isManager) return;
    setIsMembersLoading(true);
    loadMembers()
      .catch(() => toast.error('팀원 목록을 불러올 수 없습니다'))
      .finally(() => setIsMembersLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, isManager]);

  const handleChangeRole = async () => {
    if (!teamId || !roleTarget) return;
    const nextRole = roleTarget.role === 'MANAGER' ? 'PLAYER' : 'MANAGER';
    setIsChangingRole(true);
    try {
      await participationApi.updatePlayer(teamId, roleTarget.playerId, { role: nextRole });
      setMembers((prev) =>
        sortMembers(prev.map((m) => (m.playerId === roleTarget.playerId ? { ...m, role: nextRole } : m)))
      );
      toast.success(
        nextRole === 'MANAGER'
          ? `${roleTarget.name}님을 매니저로 지정했습니다`
          : `${roleTarget.name}님의 매니저 권한을 해제했습니다`
      );
      setRoleTarget(null);
    } catch (err) {
      if (getErrorStatus(err) === 403) {
        // 다른 매니저가 내 권한을 해제했을 수 있으니 최신 상태로 동기화
        toast.error('권한이 없습니다. 최신 팀 정보를 불러옵니다');
        setRoleTarget(null);
        try {
          const latest = await loadMembers();
          const me = latest.find((m) => m.playerId === playerId);
          if (me && me.role !== role) setTeam(teamId, playerId, me.role, team?.name);
        } catch {
          // 무시: 다음 진입 시 다시 불러옴
        }
      } else {
        toast.error('권한 변경에 실패했습니다');
      }
    } finally {
      setIsChangingRole(false);
    }
  };

  useEffect(() => {
    if (!teamId) return;
    Promise.all([
      teamApi.getTeam(teamId),
      isManager ? teamApi.getInviteCode(teamId) : Promise.resolve(null),
    ])
      .then(([teamRes, inviteRes]) => {
        setTeamData(teamRes.data);
        if (inviteRes) setInviteCode(inviteRes.data.inviteCode);
      })
      .catch(() => toast.error('팀 정보를 불러올 수 없습니다'))
      .finally(() => setIsLoading(false));
  }, [teamId, isManager]);

  const handleStartEdit = () => {
    if (!team) return;
    setEditName(team.name);
    setEditRegion(team.region ?? '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!teamId || !team) return;
    setIsSaving(true);
    try {
      const res = await teamApi.updateTeam(teamId, { name: editName, region: editRegion });
      setTeamData(res.data);
      setTeam(teamId!, playerId!, role!, editName);
      toast.success('팀 정보가 수정되었습니다');
      setIsEditing(false);
    } catch {
      toast.error('수정에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyInviteCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success('초대 코드가 복사되었습니다');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('복사에 실패했습니다');
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamId || !team) return;
    if (deleteConfirmName !== team.name) {
      toast.error('팀 이름이 일치하지 않습니다');
      return;
    }
    setIsDeleting(true);
    try {
      await teamApi.deleteTeam(teamId);
      toast.success('팀이 삭제되었습니다');
      router.replace('/team/select');
    } catch {
      toast.error('팀 삭제에 실패했습니다');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05060B] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-[#05060B] flex items-center justify-center">
        <p className="text-zinc-600 text-sm font-bold">팀 정보를 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05060B] text-white pb-16">
      {/* Header */}
      <header className="px-4 pt-10 pb-4 flex items-center gap-4 sticky top-0 z-50 bg-[#05060B]/90 backdrop-blur-md border-b border-white/5">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-black tracking-tight">팀 설정</h1>
        {isManager && !isEditing && (
          <button
            onClick={handleStartEdit}
            className="ml-auto w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#00F5FF]"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
        {isManager && isEditing && (
          <button
            onClick={handleCancelEdit}
            className="ml-auto w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-500"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </header>

      <div className="px-6 pt-6 space-y-4">
        {/* Team profile card */}
        <div
          className="rounded-2xl border border-white/10 overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom right, rgba(0,245,255,0.06), rgba(0,0,0,0))',
          }}
        >
          <div className="border-l-[3px] border-l-[#00F5FF] pl-5 pr-5 py-6">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-4">팀 프로필</p>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">
                    팀 이름
                  </label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-10 text-sm font-bold focus:border-[#00F5FF]/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">
                    지역
                  </label>
                  <Input
                    value={editRegion}
                    onChange={(e) => setEditRegion(e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-10 text-sm font-bold focus:border-[#00F5FF]/50"
                  />
                </div>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editName.trim()}
                  className="w-full h-10 accent-gradient text-black text-xs font-black uppercase tracking-widest rounded-xl mt-2"
                >
                  {isSaving ? (
                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : '저장'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-zinc-600 mb-0.5 uppercase tracking-widest">팀 이름</p>
                  <p className="text-xl font-black tracking-tight">{team.name}</p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 mb-0.5 uppercase tracking-widest">지역</p>
                    <p className="text-sm font-black">{team.region}</p>
                  </div>
                  {team.createdAt && (
                    <div>
                      <p className="text-[10px] font-bold text-zinc-600 mb-0.5 uppercase tracking-widest">창단일</p>
                      <p className="text-sm font-black">
                        {new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(team.createdAt))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invite code — MANAGER only */}
        {isManager && inviteCode && (
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-3">팀 초대 코드</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#05060B] border border-white/8 rounded-xl px-4 py-3">
                <p className="text-sm font-black tracking-[0.25em] text-[#00F5FF] font-mono">
                  {inviteCode}
                </p>
              </div>
              <button
                onClick={handleCopyInviteCode}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#00F5FF]/10 border border-[#00F5FF]/20 text-[#00F5FF] transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] font-bold text-zinc-600 mt-2">
              초대 코드를 팀원에게 공유하여 팀에 초대하세요
            </p>
          </div>
        )}

        {/* Member management — MANAGER only */}
        {isManager && (
          <button
            onClick={() => router.push('/squad')}
            className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-5 text-left hover:bg-white/[0.05] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00F5FF]/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#00F5FF]" />
                </div>
                <div>
                  <p className="text-sm font-black">멤버 관리</p>
                  <p className="text-[10px] font-bold text-zinc-600">팀원 목록 및 포지션 관리</p>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-zinc-600 rotate-180" />
            </div>
          </button>
        )}

        {/* Manager role management entry — MANAGER only */}
        {isManager && (
          <button
            onClick={() => setShowRoleDialog(true)}
            className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-5 text-left hover:bg-white/[0.05] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#00F5FF]/20"
                  style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.12), rgba(112,0,255,0.12))' }}
                >
                  <Crown className="w-4 h-4 text-[#00F5FF]" />
                </div>
                <div>
                  <p className="text-sm font-black">매니저 권한 관리</p>
                  <p className="text-[10px] font-bold text-zinc-600">팀원에게 매니저 권한 지정 · 해제</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {managerCount > 0 && (
                  <span className="text-[10px] font-black text-[#00F5FF]">매니저 {managerCount}명</span>
                )}
                <ChevronLeft className="w-4 h-4 text-zinc-600 rotate-180" />
              </div>
            </div>
          </button>
        )}

        {/* PLAYER view — read only team info + leave button */}
        {!isManager && (
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                <Shield className="w-4 h-4 text-zinc-500" />
              </div>
              <div>
                <p className="text-sm font-black">{team.name}</p>
                <p className="text-[10px] font-bold text-zinc-600">{team.region}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                // TODO: leave team API
                toast.info('팀 탈퇴 기능은 준비 중입니다');
              }}
              className="w-full h-10 text-xs font-black border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/10 rounded-xl"
            >
              팀 탈퇴
            </Button>
          </div>
        )}

        {/* Danger zone — MANAGER only */}
        {isManager && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] px-5 py-5 mt-2">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-red-400/80 mb-3">위험 구역</p>
            <p className="text-xs font-bold text-zinc-500 mb-4">
              팀을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full h-10 text-xs font-black bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 rounded-xl"
              variant="outline"
            >
              팀 삭제
            </Button>
          </div>
        )}
      </div>

      {/* Manager role management dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="bg-[#0E0F18] border border-white/10 text-white max-w-sm mx-auto overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[2px] accent-gradient" />
          <DialogHeader className="pt-1">
            <DialogTitle className="text-base font-black tracking-tight flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#00F5FF]" />
              매니저 권한 관리
            </DialogTitle>
            <DialogDescription className="text-[11px] font-bold text-zinc-500">
              매니저 {managerCount}명 · 본인의 권한은 변경할 수 없습니다
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] overflow-y-auto -mx-1 px-1">
            {isMembersLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-xs font-bold text-zinc-600 text-center py-6">팀원이 없습니다</p>
            ) : (
              <ul className="space-y-2">
                {members.map((m) => {
                  const isMe = m.playerId === playerId;
                  const isMemberManager = m.role === 'MANAGER';
                  return (
                    <li key={m.participationId} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                      <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {m.profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.profileImage} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-black text-zinc-500">{m.name.slice(0, 1)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-black truncate">{m.name}</p>
                          {isMe && <span className="text-[10px] font-bold text-zinc-500">(나)</span>}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {isMemberManager ? (
                            <>
                              <Crown className="w-3 h-3 text-[#00F5FF]" />
                              <span className="text-[10px] font-black text-[#00F5FF]">매니저</span>
                            </>
                          ) : (
                            <span className="text-[10px] font-bold text-zinc-600">선수</span>
                          )}
                        </div>
                      </div>
                      {!isMe && (
                        <button
                          onClick={() => setRoleTarget(m)}
                          className={
                            isMemberManager
                              ? 'h-8 px-3 rounded-lg text-[10px] font-black border border-[#7000FF]/40 bg-[#7000FF]/15 text-[#C9A6FF] hover:bg-[#7000FF]/25'
                              : 'h-8 px-3 rounded-lg text-[10px] font-black border border-[#00F5FF]/30 bg-[#00F5FF]/10 text-[#00F5FF] hover:bg-[#00F5FF]/20'
                          }
                        >
                          {isMemberManager ? '권한 해제' : '매니저 지정'}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Role change confirm dialog */}
      <Dialog open={!!roleTarget} onOpenChange={(open) => !open && !isChangingRole && setRoleTarget(null)}>
        <DialogContent className="bg-[#0E0F18] border border-white/10 text-white max-w-xs mx-auto overflow-hidden">
          {/* 상단 브랜드 그라데이션 라인 */}
          <div className="absolute inset-x-0 top-0 h-[2px] accent-gradient" />
          {(() => {
            const isRelease = roleTarget?.role === 'MANAGER';
            return (
              <>
                <DialogHeader className="items-center text-center sm:text-center pt-2">
                  <div
                    className={
                      isRelease
                        ? 'w-12 h-12 rounded-2xl flex items-center justify-center mb-2 bg-[#7000FF]/15 border border-[#7000FF]/30'
                        : 'w-12 h-12 rounded-2xl flex items-center justify-center mb-2 border border-[#00F5FF]/25'
                    }
                    style={
                      isRelease
                        ? undefined
                        : { background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(112,0,255,0.15))' }
                    }
                  >
                    {isRelease ? (
                      <ShieldOff className="w-5 h-5 text-[#A970FF]" />
                    ) : (
                      <Crown className="w-5 h-5 text-[#00F5FF]" />
                    )}
                  </div>
                  <DialogTitle className="text-base font-black tracking-tight">
                    {isRelease ? '매니저 권한 해제' : '매니저 지정'}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-zinc-400 leading-relaxed">
                    <span className={isRelease ? 'text-[#A970FF] font-black' : 'text-[#00F5FF] font-black'}>
                      {roleTarget?.name}
                    </span>
                    {isRelease ? '님의 매니저 권한을 해제할까요?' : '님을 매니저로 지정할까요?'}
                  </DialogDescription>
                </DialogHeader>

                <div className="rounded-xl bg-white/[0.03] border border-white/8 px-4 py-3 mt-1">
                  <p className="text-[11px] font-bold text-zinc-500 leading-relaxed">
                    {isRelease
                      ? '해제하면 팀 관리 기능을 더 이상 사용할 수 없습니다.'
                      : '매니저는 팀 관리 기능을 사용할 수 있고, 다른 매니저의 권한도 해제할 수 있습니다.'}
                  </p>
                </div>

                <DialogFooter className="mx-0 mb-0 p-0 border-0 bg-transparent rounded-none flex-row gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => setRoleTarget(null)}
                    disabled={isChangingRole}
                    className="flex-1 h-11 rounded-xl text-xs font-black border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleChangeRole}
                    disabled={isChangingRole}
                    className={
                      isRelease
                        ? 'flex-1 h-11 rounded-xl text-xs font-black bg-[#7000FF]/20 border border-[#7000FF]/50 text-[#C9A6FF] hover:bg-[#7000FF]/30 disabled:opacity-40'
                        : 'flex-1 h-11 rounded-xl text-xs font-black accent-gradient text-black border-0 hover:opacity-90 disabled:opacity-40'
                    }
                  >
                    {isChangingRole ? (
                      <div
                        className={
                          isRelease
                            ? 'w-3.5 h-3.5 border-2 border-[#C9A6FF]/30 border-t-[#C9A6FF] rounded-full animate-spin'
                            : 'w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin'
                        }
                      />
                    ) : isRelease ? '해제' : '지정'}
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Delete team dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#0E0F18] border border-white/10 text-white max-w-xs mx-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-red-400">팀 삭제</DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 leading-relaxed">
              팀을 삭제하면 모든 경기 기록, 선수 정보, 게시글이 영구적으로 삭제됩니다.
              <br /><br />
              계속하려면 팀 이름 <span className="text-white font-black">"{team.name}"</span>을(를) 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-1">
            <Input
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder={team.name}
              className="bg-white/5 border-white/10 text-white text-sm font-bold h-10 placeholder:text-zinc-700"
            />
          </div>
          <DialogFooter className="flex gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmName('');
              }}
              className="flex-1 h-10 text-xs font-black border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              취소
            </Button>
            <Button
              onClick={handleDeleteTeam}
              disabled={isDeleting || deleteConfirmName !== team.name}
              className="flex-1 h-10 text-xs font-black bg-red-500/80 hover:bg-red-500 text-white border-0 disabled:opacity-40"
            >
              {isDeleting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : '삭제 확인'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
