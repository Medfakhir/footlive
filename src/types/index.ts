export interface Match {
  competition: string;
  competitionImage: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamImage: string;
  awayTeamImage: string;
  homeScore: string;
  awayScore: string;
  matchStatus: string;
  matchTime: string;
  isLive: boolean;
  isPostponed: boolean;
  matchId: string;
  matchUrl: string;
  startTime: string;
  dataStatus: string;
  tvChannels: string[];
}

export interface MatchesResponse {
  matches: Match[];
  message?: string;
  error?: string;
}