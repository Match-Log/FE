import { apiClient } from './client';
import type { BoardPost, BoardDetail, Comment } from '@/types';

export const boardApi = {
  getPosts: (teamId: number) =>
    apiClient.get<BoardPost[]>(`/api/v1/boards?teamId=${teamId}`),

  createPost: (data: { title: string; content: string; teamId: number; matchId?: number }) =>
    apiClient.post<BoardPost>('/api/v1/boards', data),

  getPost: (boardId: number) =>
    apiClient.get<BoardDetail>(`/api/v1/boards/${boardId}`),

  updatePost: (boardId: number, data: { title?: string; content?: string }) =>
    apiClient.patch<BoardPost>(`/api/v1/boards/${boardId}`, data),

  deletePost: (boardId: number) =>
    apiClient.delete(`/api/v1/boards/${boardId}`),

  togglePin: (boardId: number) =>
    apiClient.patch(`/api/v1/boards/${boardId}/pin`),

  createComment: (boardId: number, data: { content: string }) =>
    apiClient.post<Comment>(`/api/v1/boards/${boardId}/comments`, data),

  updateComment: (commentId: number, data: { content: string }) =>
    apiClient.patch<Comment>(`/api/v1/comments/${commentId}`, data),

  deleteComment: (commentId: number) =>
    apiClient.delete(`/api/v1/comments/${commentId}`),
};
