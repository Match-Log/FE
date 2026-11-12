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
  isFinished: boolean;
  isVoteDeadlinePassed?: boolean;
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
  isFinished: boolean;
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

// KickerAssignment - matches AssignKickerRequestDto / AssignKickerResponseDto
export interface KickerAssignment {
  isCaptain?: boolean;
  isPkTaker?: boolean;
  isFkRight?: boolean;
  isFkLeft?: boolean;
  isCkRight?: boolean;
  isCkLeft?: boolean;
  teamId?: number;
  playerId?: number;
  updatedAt?: string;
}

// KickerRole - UI-only type for formation page specialist slots
export type KickerRole = 'CAPTAIN' | 'PENALTY' | 'LEFT_CORNER' | 'RIGHT_CORNER' | 'LEFT_FK' | 'RIGHT_FK';

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
  isStarter: boolean;
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
  isPinned?: boolean;
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
  isPinned?: boolean;
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
