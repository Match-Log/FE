'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Copy, Check, Pencil, X, Users, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { teamApi } from '@/api/team';
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
import type { TeamDetail } from '@/types';

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
