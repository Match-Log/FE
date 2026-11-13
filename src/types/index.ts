// ※ BE 응답 규칙: 기본형 `boolean isXxx` 필드는 JSON에서 `is` 없이 `xxx`로 나간다 (Jackson 기본 동작, BE 프로젝트 규칙).
//   예) finished, voteDeadlinePassed, starter, pinned. 래퍼형 `Boolean isXxx`는 `isXxx` 그대로 (예: Feedback.isVisible).
//   요청(request)은 BE DTO 필드 이름을 따른다.

// Auth
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  name: string;
}

// Team - matches MyTeamResponseDto
export interface Team {
  teamId: number;
  name: string;
  teamImage?: string;
  region?: string;
  foundedYear?: number;
  homeGround?: string;
  role: 'MANAGER' | 'PLAYER';
  inviteCode?: string;
}

// TeamDetail - matches TeamResponseDto
export interface TeamDetail {
  teamId: number;
  name: string;
  teamImage?: string;
  region?: string;
  foundedYear?: number;
  homeGround?: string;
  inviteCode?: string;
  createdAt?: string;
}

// Position - matches BE Position enum (GK is not supported by BE)
export type { Position } from '@/constants/position';
import type { Position } from '@/constants/position';

export type PreferredFoot = 'LEFT' | 'RIGHT' | 'BOTH';
export type Career = 'AMATEUR' | 'MIDDLE_SCHOOL' | 'HIGH_SCHOOL' | 'UNIVERSITY' | 'ACTIVE';

// Player - matches PlayerProfileResponseDto / RegisterPlayerResponseDto
export interface Player {
  playerId: number;
  userId: number;
  birthDate?: string;
  height?: number;
  weight?: number;
  preferredFoot?: PreferredFoot;
  career?: Career;
  preferredPosition?: Position;
  subPosition?: Position;
  createdAt?: string;
}

// Match - matches MatchResponseDto
export interface Match {
  matchId: number;
  teamId: number;
  opponent: string;
  matchDate: string;
  location?: string;
  homeAway: 'HOME' | 'AWAY';
  matchType: 'SOCCER' | 'FOOTBALL';
  scoreHome?: number;
  scoreAway?: number;
  finished: boolean;
  voteDeadlinePassed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// MatchListItem - matches MatchListItemResponseDto
export interface MatchListItem {
  matchId: number;
  opponent: string;
  matchDate: string;
  location?: string;
  homeAway: 'HOME' | 'AWAY';
  matchType: 'SOCCER' | 'FOOTBALL';
  scoreHome?: number;
  scoreAway?: number;
  finished: boolean;
}

// VoteItem - matches VoteItemResponseDto
export interface VoteItem {
  playerId: number;
  name: string;
  profileImage?: string;
  status: 'ATTEND' | 'ABSENT' | 'PENDING';
  votedAt?: string;
}

// VoteStatus - matches VoteStatusResponseDto
export interface VoteStatusResponse {
  matchId: number;
  total: number;
  attend: number;
  pending: number;
  absent: number;
  votes: VoteItem[];
}

// RoleAssignment - matches RoleAssignmentResponseDto (GET/PUT /api/v1/teams/{teamId}/role-assignment)
// 팀 단위 주장·세트피스 전담 지정. 지정 안 된 역할은 null.
export interface RoleSlot {
  participationId: number;
  playerId: number;
  name: string;
}

export type SpecialistRole = 'captain' | 'pkTaker' | 'ckLeft' | 'ckRight' | 'fkLeft' | 'fkRight';

export type RoleAssignment = { teamId: number; updatedAt?: string } & Record<SpecialistRole, RoleSlot | null>;

// UpdateRoleAssignmentRequestDto. 전체 덮어쓰기라 null(또는 생략)이면 지정 해제된다.
export type UpdateRoleAssignmentRequest = Partial<Record<`${SpecialistRole}ParticipationId`, number | null>>;

// RosterItem - matches RosterItemResponseDto
export interface RosterItem {
  participationId: number;
  teamId: number;
  playerId: number;
  userId: number;
  name: string;
  profileImage?: string;
  role: 'MANAGER' | 'PLAYER';
  number?: number;
  mainPosition?: Position;
  subPosition?: Position;
  joinedAt?: string;
}

// LineupSpot - matches LineupSpotResponseDto
export interface LineupSpot {
  spotId?: number;
  playerId?: number;
  guestId?: number;
  name?: string;
  position: string;
  starter: boolean;
}

// LineupSpotRequest - for saving lineup
export interface LineupSpotRequest {
  playerId?: number;
  guestId?: number;
  position: string;
  isStarter: boolean;
}

// Lineup - matches LineupResponseDto
export interface Lineup {
  lineupId?: number;
  matchId?: number;
  quarter: number;
  formation: string;
  matchType?: 'SOCCER' | 'FOOTBALL';
  spots: LineupSpot[];
}

// Feedback - matches FeedbackResponseDto
export interface Feedback {
  feedbackId?: number;
  matchId?: number;
  scope?: 'team' | 'player';
  playerId?: number;
  content?: string;
  rating?: number;
  pros?: string;
  cons?: string;
  tags?: string[];
  isVisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// PlayerStat - matches PlayerStatResponseDto
export interface PlayerStat {
  matchId?: number;
  playerId?: number;
  name?: string;
  goals?: number;
  assists?: number;
  saves?: number;
}

// PlayerStatItem - matches PlayerStatItemResponseDto
export interface PlayerStatItem {
  playerId?: number;
  name?: string;
  position?: string;
  goals?: number;
  assists?: number;
  saves?: number;
}

// MatchStatList - matches MatchStatListResponseDto
export interface MatchStatList {
  matchId: number;
  stats: PlayerStatItem[];
}

// BoardPost - matches DocumentListItemResponseDto
export interface BoardPost {
  boardId: number;
  teamId: number;
  playerId: number;
  playerName: string;
  title: string;
  matchId?: number;
  pinned?: boolean;
  createdAt: string;
}

// BoardDetail - matches DocumentResponseDto
export interface BoardDetail {
  boardId: number;
  teamId: number;
  playerId: number;
  playerName: string;
  title: string;
  content: string;
  matchId?: number;
  pinned?: boolean;
  createdAt: string;
  updatedAt?: string;
  comments: Comment[];
}

// Comment - matches CommentResponseDto
export interface Comment {
  commentId: number;
  boardId?: number;
  playerId: number;
  playerName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}
