'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart2,
  ChevronRight,
  Users,
  Key,
  Info,
  PenLine,
  ShieldHalf,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { teamApi } from '@/api/team';
import { authApi } from '@/api/auth';
import { joinTeamSchema, type JoinTeamFormData } from '@/schemas/team';
import { useTeamStore } from '@/stores/teamStore';
import { useAuthStore } from '@/stores/authStore';
import type { Team } from '@/types';
import GridBackground from '@/components/common/GridBackground';

export default function TeamSelectPage() {
  const router = useRouter();
  const { playerId, setTeam, clear } = useTeamStore();
  const { logout } = useAuthStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const userName =
    typeof window !== 'undefined' ? localStorage.getItem('userName') || '사용자' : '사용자';

  const {
    register: registerJoin,
    handleSubmit: handleJoinSubmit,
    reset: resetJoin,
    formState: { errors: joinErrors },
  } = useForm<JoinTeamFormData>({ resolver: zodResolver(joinTeamSchema) });

  useEffect(() => {
    teamApi
      .getTeams()
      .then((res) => setTeams(res.data))
      .catch(() => setTeams([]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelectTeam = (team: Team) => {
    setTeam(team.teamId, team.playerId ?? 0, team.role, team.name);
    router.push('/home');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    document.cookie = 'accessToken=; path=/; max-age=0';
    logout();
    clear();
    router.push('/login');
  };

  const onJoinSubmit = async (data: JoinTeamFormData) => {
    setIsJoining(true);
    try {
      const res = await teamApi.joinTeam(data);
      const team = res.data;
      setTeam(team.teamId, team.playerId ?? 0, team.role);
      toast.success('팀에 합류했습니다!');
      setJoinDialogOpen(false);
      resetJoin();
      router.push('/home');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || '초대 코드가 유효하지 않습니다');
    } finally {
      setIsJoining(false);
    }
  };

  const nameInitials = userName.slice(0, 2);
  const isPlayerRegistered = playerId !== null;

  return (
    <div className="min-h-screen bg-[#05060B] text-white flex flex-col max-w-md mx-auto relative">
      {/* Nav */}
      <nav className="px-6 py-6 flex items-center justify-between sticky top-0 bg-[#05060B]/80 backdrop-blur-md z-30 border-b border-white/5">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-[#00F5FF]" />
          <span className="text-xl font-black italic uppercase tracking-tighter">
            Match<span className="text-[#00F5FF]">Log</span>
          </span>
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
          <span className="text-[10px] font-black text-[#00F5FF]">{nameInitials}</span>
        </div>
      </nav>

      <main className="flex-grow px-6 pt-8 pb-12 relative overflow-hidden">
        <GridBackground />
        <div className="absolute top-[20%] right-[-20%] w-64 h-64 bg-[#7000FF]/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Greeting */}
        <header className="relative z-10 mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            안녕하세요,{' '}
            <span className="accent-gradient-text italic">{userName}님</span> 👋
          </h1>
          <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase">
            {isPlayerRegistered
              ? '참여할 팀을 선택하고 데이터를 확인하세요.'
              : 'Protocol: Pending Player Activation'}
          </p>
        </header>

        {/* === 미등록 상태 === */}
        {!isPlayerRegistered && (
          <>
            <section className="relative z-10 mb-6">
              <div className="bg-zinc-900/40 border-l-4 border-[#00F5FF] p-5 rounded-r-sm">
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-[#00F5FF]/10 flex items-center justify-center">
                    <Info className="w-4 h-4 text-[#00F5FF]" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1">
                      Authorization Required
                    </p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      선수 등록을 먼저 완료하면 팀 생성 및 초대 코드 가입 기능이 활성화됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="relative z-10 mb-12">
              <Link
                href="/onboarding/register-player"
                className="w-full bg-[#0A0B14] border border-[#00F5FF]/30 p-6 rounded-sm shadow-[0_0_20px_rgba(0,245,255,0.15)] flex items-center justify-between group hover:border-[#00F5FF] transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
                    <span className="text-2xl">⚽</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-black uppercase tracking-tight mb-1 group-hover:text-[#00F5FF] transition-colors">
                      선수 등록하기
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase italic">
                      Birth · Physical · Bias · Career
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#00F5FF] group-hover:translate-x-1 transition-transform" />
              </Link>
            </section>

            <section className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                  Team Participation
                </span>
                <div className="flex-grow h-px bg-white/5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-8 rounded-sm flex flex-col items-center justify-center text-center bg-white/[0.02] border border-white/5 opacity-50">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900/50 flex items-center justify-center mb-4">
                    <Users className="w-5 h-5 text-zinc-700" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">팀 생성</h4>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tight leading-tight">내가 만드는 새로운 팀</p>
                </div>
                <div className="p-8 rounded-sm flex flex-col items-center justify-center text-center bg-white/[0.02] border border-white/5 opacity-50">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900/50 flex items-center justify-center mb-4">
                    <Key className="w-5 h-5 text-zinc-700 rotate-45" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">초대 코드 가입</h4>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tight leading-tight">코드로 기존 팀 합류</p>
                </div>
              </div>
              <p className="mt-8 text-center text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em]">
                🔒 Locked until player sync complete
              </p>
            </section>
          </>
        )}

        {/* === 등록된 상태 === */}
        {isPlayerRegistered && (
          <>
            {/* 팀 목록 */}
            {!isLoading && teams.length > 0 && (
              <section className="relative z-10 mb-10">
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                    My Squads {teams.length}
                  </span>
                  <span className="text-[10px] font-black text-[#00F5FF] uppercase tracking-widest">
                    Active Status
                  </span>
                </div>
                <div className="space-y-3">
                  {teams.map((team) => (
                    <button
                      key={team.teamId}
                      onClick={() => handleSelectTeam(team)}
                      className="w-full bg-[#0A0B14]/80 border border-white/5 backdrop-blur-sm p-5 rounded-sm flex items-center justify-between border-l-4 border-l-[#00F5FF] shadow-[0_0_20px_rgba(0,245,255,0.1)] group hover:bg-zinc-900/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-xs font-black text-[#00F5FF]">
                          {team.name.slice(0, 2)}
                        </div>
                        <div className="text-left">
                          <h3 className="text-base font-black uppercase tracking-tight mb-0.5 group-hover:text-[#00F5FF] transition-colors">
                            {team.name}
                          </h3>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                            {team.matchType === 'SOCCER' ? '리그팀' : '풋살팀'} · {team.region}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={
                            team.role === 'MANAGER'
                              ? 'px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[9px] font-black uppercase tracking-tighter'
                              : 'px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#00F5FF] text-[9px] font-black uppercase tracking-tighter'
                          }
                        >
                          {team.role === 'MANAGER' ? 'Manager' : 'Player'}
                        </span>
                        <ChevronRight className="w-3 h-3 text-zinc-700 group-hover:text-[#00F5FF] transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {!isLoading && teams.length === 0 && (
              <section className="relative z-10 mb-10 text-center py-10">
                <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">
                  아직 소속된 팀이 없습니다
                </p>
              </section>
            )}

            {/* 팀 액션 */}
            <section className="relative z-10 mb-12">
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/team/create"
                  className="bg-[#0A0B14]/80 border border-white/5 backdrop-blur-sm p-6 rounded-sm flex flex-col items-center justify-center text-center group border-dashed border-white/10 hover:border-[#00F5FF]/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#00F5FF]/5 border border-[#00F5FF]/20 flex items-center justify-center mb-4 group-hover:bg-[#00F5FF]/10 transition-all">
                    <Users className="w-5 h-5 text-[#00F5FF]" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-1">팀 생성</h4>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tight italic">Create New Squad</p>
                </Link>

                <button
                  type="button"
                  onClick={() => setJoinDialogOpen(true)}
                  className="bg-[#0A0B14]/80 border border-white/5 backdrop-blur-sm p-6 rounded-sm flex flex-col items-center justify-center text-center group border-dashed border-white/10 hover:border-[#00F5FF]/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-4 group-hover:bg-zinc-800 transition-all">
                    <Key className="w-5 h-5 text-zinc-400 rotate-45 group-hover:text-[#00F5FF] transition-all" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-1">초대 코드 가입</h4>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tight italic">Join Existing Team</p>
                </button>
              </div>
            </section>

            {/* 프로필 섹션 */}
            <section className="relative z-10 pt-10 border-t border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                  Profile & Security
                </span>
                <div className="flex-grow h-px bg-white/5" />
              </div>

              <div className="bg-[#0A0B14]/80 border border-white/5 backdrop-blur-sm rounded-sm overflow-hidden">
                <div className="p-6 flex items-center gap-5 border-b border-white/5 bg-white/[0.02]">
                  <div className="w-14 h-14 rounded-full bg-zinc-900 border border-[#00F5FF]/20 flex items-center justify-center text-[#00F5FF] font-black text-lg">
                    {nameInitials}
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight">{userName}</h3>
                  </div>
                </div>
                <div className="divide-y divide-white/5">
                  <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors group">
                    <div className="flex items-center gap-4">
                      <PenLine className="w-4 h-4 text-zinc-600 group-hover:text-[#00F5FF]" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-zinc-300">
                        프로필 수정
                      </span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-zinc-800" />
                  </button>
                  <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors group">
                    <div className="flex items-center gap-4">
                      <ShieldHalf className="w-4 h-4 text-zinc-600 group-hover:text-[#00F5FF]" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-zinc-300">
                        비밀번호 변경
                      </span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-zinc-800" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-rose-500/5 transition-colors group"
                  >
                    <LogOut className="w-4 h-4 text-rose-500/50 group-hover:text-rose-500" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-rose-500/70 group-hover:text-rose-500">
                      로그아웃
                    </span>
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="p-8 text-center relative z-10">
        <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em]">
          MatchLog Data Protocol v2.0
        </p>
      </footer>

      <div className="fixed bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00F5FF]/20 to-transparent" />

      {/* 초대 코드 Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="bg-[#0A0B14] border border-white/10 text-white max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-[#00F5FF]/20 flex items-center justify-center mb-4 mx-auto shadow-[0_0_30px_rgba(0,245,255,0.1)]">
              <Key className="w-6 h-6 text-[#00F5FF] rotate-45" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tighter uppercase text-center">
              Invite{' '}
              <span className="accent-gradient-text">Code</span>
            </DialogTitle>
            <p className="text-zinc-500 text-xs font-bold text-center uppercase tracking-tight">
              전달받은 초대 코드를 입력하여<br />기존 팀에 합류하세요.
            </p>
          </DialogHeader>

          <form onSubmit={handleJoinSubmit(onJoinSubmit)} className="space-y-6 mt-4">
            <div>
              <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] text-center mb-4">
                Enter Access Token
              </label>
              <input
                type="text"
                placeholder="초대 코드 입력"
                {...registerJoin('inviteCode')}
                className="w-full bg-zinc-900/30 border-b-2 border-zinc-800 py-5 text-xl font-black text-[#00F5FF] text-center tracking-[0.5em] uppercase focus:border-[#00F5FF] transition-all outline-none bg-transparent"
              />
              {joinErrors.inviteCode && (
                <p className="text-xs text-red-400 text-center mt-2">{joinErrors.inviteCode.message}</p>
              )}
            </div>
            <div className="flex items-center justify-center gap-3 py-3 px-4 bg-zinc-900/50 border border-white/5 rounded-sm">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                코드는 대소문자를 구분하지 않습니다.
              </p>
            </div>
            <button
              type="submit"
              disabled={isJoining}
              className="w-full accent-gradient text-black font-black py-4 text-sm uppercase tracking-[0.2em] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isJoining ? '확인 중...' : 'Verify & Join Squad'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
