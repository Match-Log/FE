'use client';

import { getNameInitials, cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Pin, Pencil, Trash2, Send, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { boardApi } from '@/api/board';
import { voteApi } from '@/api/vote';
import { useTeamStore } from '@/stores/teamStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { BoardDetail, Comment, VoteItem } from '@/types';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(d);
}

export default function BoardDetailPage() {
  const router = useRouter();
  const { boardId } = useParams<{ boardId: string }>();
  const { role, playerId: myPlayerId } = useTeamStore();
  const isManager = role === 'MANAGER';

  const [post, setPost] = useState<BoardDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 경기와 연결된 게시글이면 참석 투표 카드를 띄운다 (Home 투표 UI와 동일).
  const [votes, setVotes] = useState<VoteItem[]>([]);
  const [isVoting, setIsVoting] = useState(false);

  // Comment state
  const [commentInput, setCommentInput] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);

  // Inline comment editing
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Delete post dialog
  const [showDeletePostDialog, setShowDeletePostDialog] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  // Post options menu
  const [showPostMenu, setShowPostMenu] = useState(false);

  const commentInputRef = useRef<HTMLInputElement>(null);

  const id = Number(boardId);
  const matchId = post?.matchId;
  // 투표 글 판별은 type이 담당한다. matchId는 "어떤 경기의 투표냐"를 가리키는 보조값.
  const isVotePost = post?.type === 'VOTE' && matchId != null;

  const myVote = votes.find((v) => v.playerId === myPlayerId);
  const attendCount = votes.filter((v) => v.status === 'ATTEND').length;
  const absentCount = votes.filter((v) => v.status === 'ABSENT').length;
  const pendingCount = votes.filter((v) => v.status === 'PENDING').length;

  useEffect(() => {
    boardApi.getPost(id)
      .then((r) => setPost(r.data))
      .catch(() => toast.error('게시글을 불러올 수 없습니다'))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (matchId == null) return;
    voteApi.getVotes(matchId)
      .then((r) => setVotes(r.data.votes))
      .catch(() => {});
  }, [matchId]);

  const handleVote = async (status: 'ATTEND' | 'ABSENT') => {
    if (matchId == null || isVoting) return;
    const nextStatus = myVote?.status === status ? 'PENDING' : status;
    setIsVoting(true);
    try {
      await voteApi.vote(matchId, { status: nextStatus });
      const res = await voteApi.getVotes(matchId);
      setVotes(res.data.votes);
    } catch {
      toast.error('투표에 실패했습니다');
    } finally {
      setIsVoting(false);
    }
  };

  const handleTogglePin = async () => {
    if (!post) return;
    try {
      await boardApi.togglePin(post.boardId);
      setPost((p) => p ? { ...p, pinned: !p.pinned } : p);
      toast.success('게시글 고정 상태가 변경되었습니다');
    } catch {
      toast.error('처리에 실패했습니다');
    }
    setShowPostMenu(false);
  };

  const handleDeletePost = async () => {
    if (!post) return;
    setIsDeletingPost(true);
    try {
      await boardApi.deletePost(post.boardId);
      toast.success('게시글이 삭제되었습니다');
      router.replace('/board');
    } catch {
      toast.error('삭제에 실패했습니다');
    } finally {
      setIsDeletingPost(false);
      setShowDeletePostDialog(false);
    }
  };

  const handleSendComment = async () => {
    if (!commentInput.trim() || !post || isSendingComment) return;
    setIsSendingComment(true);
    try {
      const res = await boardApi.createComment(post.boardId, { content: commentInput.trim() });
      setPost((p) => p ? { ...p, comments: [...p.comments, res.data] } : p);
      setCommentInput('');
    } catch {
      toast.error('댓글 등록에 실패했습니다');
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleStartEditComment = (comment: Comment) => {
    setEditingCommentId(comment.commentId);
    setEditingContent(comment.content);
  };

  const handleSaveEditComment = async (commentId: number) => {
    if (!editingContent.trim()) return;
    try {
      const res = await boardApi.updateComment(commentId, { content: editingContent.trim() });
      setPost((p) =>
        p
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c.commentId === commentId ? res.data : c
              ),
            }
          : p
      );
      setEditingCommentId(null);
    } catch {
      toast.error('수정에 실패했습니다');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await boardApi.deleteComment(commentId);
      setPost((p) =>
        p ? { ...p, comments: p.comments.filter((c) => c.commentId !== commentId) } : p
      );
    } catch {
      toast.error('삭제에 실패했습니다');
    }
  };

  const isMyComment = (comment: Comment) =>
    myPlayerId !== null && myPlayerId === comment.playerId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05060B] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#05060B] flex items-center justify-center">
        <p className="text-zinc-600 text-sm font-bold">게시글을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05060B] text-white flex flex-col">
      {/* Header */}
      <header className="px-4 pt-8 pb-4 flex items-center gap-3 sticky top-0 z-50 bg-[#05060B]/90 backdrop-blur-md border-b border-white/5">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h1 className="flex-1 text-sm font-black tracking-tight truncate">게시글</h1>
        {isManager && (
          <div className="relative">
            <button
              onClick={() => setShowPostMenu((v) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showPostMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPostMenu(false)} />
                <div className="absolute right-0 top-11 z-50 min-w-[140px] bg-[#0E0F18] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                  <button
                    onClick={handleTogglePin}
                    className="w-full px-4 py-3 text-left text-xs font-bold text-zinc-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Pin className="w-3.5 h-3.5 text-[#00F5FF]" />
                    {post.pinned ? '고정 해제' : '게시글 고정'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPostMenu(false);
                      router.push(`/board/${post.boardId}/edit`);
                    }}
                    className="w-full px-4 py-3 text-left text-xs font-bold text-zinc-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                    게시글 수정
                  </button>
                  <button
                    onClick={() => {
                      setShowPostMenu(false);
                      setShowDeletePostDialog(true);
                    }}
                    className="w-full px-4 py-3 text-left text-xs font-bold text-red-400 hover:bg-red-400/5 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    게시글 삭제
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* Post content */}
      <main className="flex-1 px-6 pt-6 pb-10">
        {/* Pinned indicator */}
        {post.pinned && (
          <div className="flex items-center gap-1.5 mb-4">
            <Pin className="w-3 h-3 text-[#00F5FF]" />
            <span className="text-[10px] font-black text-[#00F5FF] uppercase tracking-widest">Pinned</span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-xl font-black mb-3 leading-tight tracking-tight">{post.title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
          <div className="w-7 h-7 rounded-full bg-[#00F5FF]/15 flex items-center justify-center text-[9px] font-black text-[#00F5FF]">
            {getNameInitials(post.playerName)}
          </div>
          <div>
            <p className="text-xs font-black text-zinc-300">{post.playerName}</p>
            <p className="text-[10px] font-bold text-zinc-600">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm font-medium text-zinc-300 leading-7 whitespace-pre-wrap">{post.content}</p>

        {/* Attendance vote (type === VOTE 글만) */}
        {isVotePost && (
          <div
            className="mt-8 p-6 border border-[#00F5FF]/10 rounded-[1.5rem]"
            style={{ background: 'rgba(18, 20, 32, 0.4)' }}
          >
            <p className="text-[10px] font-black text-[#00F5FF] uppercase tracking-widest mb-5">
              참석 투표
            </p>

            {/* Vote Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => handleVote('ATTEND')}
                disabled={isVoting}
                className={cn(
                  'py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98]',
                  myVote?.status === 'ATTEND'
                    ? 'accent-gradient text-black shadow-[0_0_20px_rgba(0,245,255,0.2)]'
                    : 'bg-[#1A1B23] border border-white/5 text-zinc-500'
                )}
              >
                참석
              </button>
              <button
                onClick={() => handleVote('ABSENT')}
                disabled={isVoting}
                className={cn(
                  'py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98]',
                  myVote?.status === 'ABSENT'
                    ? 'accent-gradient text-black shadow-[0_0_20px_rgba(0,245,255,0.2)]'
                    : 'bg-[#1A1B23] border border-white/5 text-zinc-500'
                )}
              >
                불참
              </button>
            </div>

            {/* Vote Stats */}
            <div className="flex items-center justify-between px-2">
              <div className="text-center">
                <p className="text-2xl font-black text-[#00F5FF] mb-1">
                  {String(attendCount).padStart(2, '0')}
                </p>
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Attend</p>
              </div>
              <div className="w-px h-10 bg-white/5" />
              <div className="text-center">
                <p className="text-2xl font-black text-zinc-600 mb-1">
                  {String(pendingCount).padStart(2, '0')}
                </p>
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Pending</p>
              </div>
              <div className="w-px h-10 bg-white/5" />
              <div className="text-center">
                <p className="text-2xl font-black text-zinc-400 mb-1">
                  {String(absentCount).padStart(2, '0')}
                </p>
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Absent</p>
              </div>
            </div>
          </div>
        )}

        {/* Comment input (참석 투표 카드와 댓글 목록 사이에 inline 배치) */}
        <div className="mt-8 flex items-center gap-3">
          <input
            ref={commentInputRef}
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => {
              // 한글 IME 조합 중 Enter는 무시 (중복 제출 방지)
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSendComment();
              }
            }}
            placeholder="댓글을 입력하세요..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00F5FF]/40"
          />
          <button
            onClick={handleSendComment}
            disabled={!commentInput.trim() || isSendingComment}
            className="w-10 h-10 flex items-center justify-center rounded-xl accent-gradient disabled:opacity-40 flex-shrink-0"
          >
            {isSendingComment ? (
              <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-black" />
            )}
          </button>
        </div>

        {/* Comments section */}
        <div className="mt-10">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-5">
            댓글 {post.comments.length}
          </h2>

          {post.comments.length === 0 ? (
            <p className="text-center text-zinc-700 text-xs font-bold py-8">
              아직 댓글이 없습니다
            </p>
          ) : (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.commentId} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] font-black text-zinc-500 flex-shrink-0 mt-0.5">
                    {getNameInitials(comment.playerName)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-zinc-300">{comment.playerName}</span>
                        <span className="text-[10px] font-bold text-zinc-600">{formatDate(comment.createdAt)}</span>
                      </div>
                      {(isMyComment(comment) || isManager) && editingCommentId !== comment.commentId && (
                        <div className="flex items-center gap-1">
                          {isMyComment(comment) && (
                            <button
                              onClick={() => handleStartEditComment(comment)}
                              className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/5"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteComment(comment.commentId)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {editingCommentId === comment.commentId ? (
                      <div className="flex gap-2">
                        <input
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSaveEditComment(comment.commentId);
                            if (e.key === 'Escape') setEditingCommentId(null);
                          }}
                          autoFocus
                          className="flex-1 bg-white/5 border border-[#00F5FF]/30 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEditComment(comment.commentId)}
                          className="text-[10px] font-black text-[#00F5FF] px-2"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="text-[10px] font-black text-zinc-600 px-1"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-zinc-400 leading-relaxed">{comment.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete post confirmation dialog */}
      <Dialog open={showDeletePostDialog} onOpenChange={setShowDeletePostDialog}>
        <DialogContent className="bg-[#0E0F18] border border-white/10 text-white max-w-xs mx-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-black">게시글 삭제</DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              게시글을 삭제하면 복구할 수 없습니다. 정말 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowDeletePostDialog(false)}
              className="flex-1 h-10 text-xs font-black border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              취소
            </Button>
            <Button
              onClick={handleDeletePost}
              disabled={isDeletingPost}
              className="flex-1 h-10 text-xs font-black bg-red-500/80 hover:bg-red-500 text-white border-0"
            >
              {isDeletingPost ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
