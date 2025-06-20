import React, { useMemo } from 'react';
import { Match } from '@/types';
import MatchCard from './MatchCard';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

interface MatchesListProps {
  matches: Match[];
  isLoading: boolean;
  error: string | null;
}

const MatchesList: React.FC<MatchesListProps> = ({ matches, isLoading, error }) => {
  // Group matches by competition using useMemo for performance
  const matchesByCompetition = useMemo(() => {
    return matches.reduce<Record<string, Match[]>>((acc, match) => {
      if (!acc[match.competition]) {
        acc[match.competition] = [];
      }
      acc[match.competition].push(match);
      return acc;
    }, {});
  }, [matches]);

  // Sort competitions based on priority
  const sortedCompetitions = useMemo(() => {
    const priorityMap: Record<string, number> = {
      'Champions League': 1,
      'Premier League': 2,
      'La Liga': 3,
      'Serie A': 4,
      'Bundesliga': 5
    };
    
    return Object.keys(matchesByCompetition).sort((a, b) => {
      // If both competitions are in the priority map, sort by priority
      if (a in priorityMap && b in priorityMap) {
        return priorityMap[a] - priorityMap[b];
      }
      // If only a is in the priority map, a comes first
      if (a in priorityMap) return -1;
      // If only b is in the priority map, b comes first
      if (b in priorityMap) return 1;
      // If neither is in the priority map, sort alphabetically
      return a.localeCompare(b);
    });
  }, [matchesByCompetition]);

  if (isLoading) {
    return <LoadingSpinner message="Loading match data..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400 animate-float">
        <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-soft mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-2xl"></div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-6 text-primary/60 dark:text-primary-dark/60 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-2">No Matches Found</h3>
          <p className="text-center text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            There are no matches scheduled for the selected date. Try selecting a different date or check back later.
          </p>
          <div className="mt-6 flex justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {sortedCompetitions.map((competition, index) => {
        const competitionMatches = matchesByCompetition[competition];
        return (
          <div 
            key={competition} 
            className={`mb-6 bg-card dark:bg-card rounded-xl shadow-card overflow-hidden border border-border dark:border-border animate-slide-in-bottom`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 dark:from-primary/10 dark:via-transparent dark:to-secondary/10 border-b border-border dark:border-border">
              <div className="flex items-center">
                <h2 className="text-lg font-bold text-card-foreground">{competition}</h2>
                <span className="ml-3 text-xs font-medium text-white bg-primary dark:bg-primary-dark px-2.5 py-1 rounded-full">
                  {competitionMatches.length}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {competitionMatches.filter(m => m.isLive).length > 0 && (
                  <span className="inline-flex items-center mr-3 text-danger">
                    <span className="relative flex h-2 w-2 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
                    </span>
                    Live
                  </span>
                )}
                {competitionMatches.length} {competitionMatches.length === 1 ? 'Match' : 'Matches'}
              </div>
            </div>
            <div className="p-5 space-y-4 divide-y divide-border dark:divide-border">
              {competitionMatches.map((match, matchIndex) => (
                <div 
                  key={`${match.matchId}-${match.startTime}`} 
                  className="pt-4 first:pt-0"
                  style={{ animationDelay: `${(index * 0.1) + (matchIndex * 0.05)}s` }}
                >
                  <MatchCard match={match} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(MatchesList);