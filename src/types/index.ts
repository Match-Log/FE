export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  name: string;
}

export interface Team {
  teamId: number;
  name: string;
  region: string;
  matchType: 'SOCCER' | 'FUTSAL';
  role: 'MANAGER' | 'PLAYER';
  playerId?: number;
}

export type Position =
  | 'GK'
  | 'CB' | 'LB' | 'RB' | 'WB'
  | 'CDM' | 'CM' | 'LM' | 'RM' | 'CAM' | 'AM'
  | 'LW' | 'RW' | 'ST' | 'CF';

export type PreferredFoot = 'LEFT' | 'RIGHT' | 'BOTH';

export interface Player {
  playerId: number;
  name: string;
  birthDate?: string;
  height?: number;
  weight?: number;
  preferredFoot?: PreferredFoot;
  career?: string;
  preferredPosition?: Position;
  subPosition?: Position;
}

export interface Match {
  matchId: number;
  teamId: number;
  opponentTeam: string;
  matchDate: string;
  location: string;
  matchType: 'SOCCER' | 'FUTSAL';
  homeAway: 'HOME' | 'AWAY';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  memo?: string;
  leagueInfo?: string;
  myScore?: number;
  opponentScore?: number;
}

export interface Vote {
  playerId: number;
  playerName: string;
  status: 'ATTEND' | 'ABSENT' | 'PENDING';
}

export type KickerRole = 'CAPTAIN' | 'PENALTY' | 'LEFT_CORNER' | 'RIGHT_CORNER' | 'LEFT_FK' | 'RIGHT_FK';

export interface TeamPlayer {
  playerId: number;
  name: string;
  number: number;
  mainPosition: 'GK' | 'DF' | 'MF' | 'FW';
  subPositions: ('GK' | 'DF' | 'MF' | 'FW')[];
  role: 'MANAGER' | 'PLAYER';
  kickerRole?: KickerRole;
}

export interface LineupSpot {
  playerId: number;
  position: string;
  x: number;
  y: number;
}

export interface Lineup {
  quarter: number;
  formation: string;
  spots: LineupSpot[];
}

export interface Feedback {
  feedbackId?: number;
  coachName?: string;
  content: string;
  rating?: number;
  createdAt?: string;
  matchId?: number;
  opponentTeam?: string;
}

export interface PlayerStat {
  goals: number;
  assists: number;
  rating: number;
  minutesPlayed?: number;
  matchId?: number;
  opponentTeam?: string;
  matchDate?: string;
}

export interface BoardPost {
  boardId: number;
  title: string;
  content?: string;
  authorId: number;
  authorName: string;
  teamId: number;
  isPinned: boolean;
  commentCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  commentId: number;
  boardId?: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface BoardDetail extends BoardPost {
  content: string;
  comments: Comment[];
}

export interface TeamDetail {
  teamId: number;
  name: string;
  region: string;
  matchType: 'SOCCER' | 'FUTSAL';
  createdAt?: string;
}
