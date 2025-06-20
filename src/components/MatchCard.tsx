import React, { memo } from 'react';
import Image from 'next/image';
import { Match } from '@/types';

interface MatchCardProps {
  match: Match;
}

// Using memo to prevent unnecessary re-renders
const MatchCard: React.FC<MatchCardProps> = memo(({ match }) => {
  // Format match time or status for display
  const getStatusDisplay = () => {
    if (match.isLive) {
      return (
        <div className="flex items-center">
          <span className="relative flex h-3 w-3 mr-1.5">
            <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-danger"></span>
          </span>
          <span className="text-danger font-bold">{match.matchStatus}</span>
        </div>
      );
    }
    if (match.isPostponed) {
      return (
        <div className="flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-warning" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">Postponed</span>
        </div>
      );
    }
    return (
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <span className="text-gray-600 dark:text-gray-400 font-medium">{match.matchTime}</span>
      </div>
    );
  };

  return (
    <div className="bg-card dark:bg-card rounded-lg shadow-card hover:shadow-card-hover p-4 border border-border dark:border-border transition-all duration-300 transform hover:-translate-y-1 animate-bounce-in">
      <div className="flex justify-between items-center">
        {/* Match status/time */}
        <div className="text-sm">
          {getStatusDisplay()}
        </div>
        
        {/* TV channels if available */}
        {match.tvChannels.length > 0 && (
          <div className="flex items-center text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-8h1V5h-1v2zm0 8h1v-2h-1v2zM9 13v2H7v-2h2zm0-8H7v2h2V5zm6 6h-1v2h1v-2zm-4-4h-1v2h1V7zm-4 0v2h2V7H7z" clipRule="evenodd" />
            </svg>
            {match.tvChannels.join(', ')}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        {/* Home team */}
        <div className="flex items-center space-x-3 w-2/5">
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-50 dark:bg-gray-800 border-2 border-primary/20 dark:border-primary/30 shadow-inner-glow">
            {match.homeTeamImage ? (
              <Image 
                src={match.homeTeamImage} 
                alt={match.homeTeam} 
                width={40}
                height={40}
                className="h-full w-full object-contain p-1.5"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-xs font-bold text-primary">
                {match.homeTeam.substring(0, 2)}
              </div>
            )}
          </div>
          <span className="font-semibold truncate text-card-foreground">{match.homeTeam}</span>
        </div>
        
        {/* Score */}
        <div className="text-center font-bold px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-lg min-w-[70px] shadow-inner-glow">
          <span className="text-primary dark:text-primary-dark">{match.homeScore}</span>
          <span className="mx-1 text-gray-500 dark:text-gray-400">-</span>
          <span className="text-primary dark:text-primary-dark">{match.awayScore}</span>
        </div>
        
        {/* Away team */}
        <div className="flex items-center justify-end space-x-3 w-2/5">
          <span className="font-semibold truncate text-card-foreground">{match.awayTeam}</span>
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-50 dark:bg-gray-800 border-2 border-primary/20 dark:border-primary/30 shadow-inner-glow">
            {match.awayTeamImage ? (
              <Image 
                src={match.awayTeamImage} 
                alt={match.awayTeam} 
                width={40}
                height={40}
                className="h-full w-full object-contain p-1.5"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-xs font-bold text-primary">
                {match.awayTeam.substring(0, 2)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// Display name for debugging
MatchCard.displayName = 'MatchCard';

export default MatchCard;