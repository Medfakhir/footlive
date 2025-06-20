'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
// Removing unused Image import
import MatchesList from '@/components/MatchesList';
import { Match } from '@/types';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';

// Separate component to use searchParams inside Suspense boundary
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get date from URL or use today
  const initialDate = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  // Removed displayDate state since it's not being used in the component

  const fetchMatches = useCallback(async (date = selectedDate) => {
    try {
      setRefreshing(true);
      console.log(`Fetching matches for ${date}...`);
      const response = await fetch(`/api/scrape?date=${date}`);
      const data = await response.json();
      console.log('API response:', data);
      
      if (data.error) {
        setError(data.error);
      } else if (data.matches && data.matches.length > 0) {
        console.log(`Found ${data.matches.length} matches`);
        setMatches(data.matches);
        setError(null);
      } else {
        setError('No matches found');
      }
    } catch (err) {
      setError('Failed to fetch match data. Please try again later.');
      console.error('Error fetching matches:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchMatches(selectedDate);
    
    // Update URL with the selected date
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', selectedDate);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [selectedDate, fetchMatches, router, searchParams]);
  
  const navigateDate = useCallback((direction: 'prev' | 'next' | 'today') => {
    let newDate;
    if (direction === 'prev') {
      newDate = subDays(parseISO(selectedDate), 1);
    } else if (direction === 'next') {
      newDate = addDays(parseISO(selectedDate), 1);
    } else {
      newDate = new Date();
    }
    
    const formattedDate = format(newDate, 'yyyy-MM-dd');
    setSelectedDate(formattedDate);
  }, [selectedDate]);

  // Memoize the date navigation component for better performance
  const DateNavigationComponent = useMemo(() => {
    // Generate a list of 5 days (2 before current, current, 2 after current)
    const currentDateObj = parseISO(selectedDate);
    const dateList = [-2, -1, 0, 1, 2].map(offset => {
      const date = offset === 0 ? currentDateObj : (offset < 0 ? subDays(currentDateObj, Math.abs(offset)) : addDays(currentDateObj, offset));
      const dateString = format(date, 'yyyy-MM-dd');
      return {
        date,
        dateString,
        isSelected: dateString === selectedDate,
        dayOfMonth: format(date, 'd'),
        dayOfWeek: format(date, 'EEE'),
        isToday: format(new Date(), 'yyyy-MM-dd') === dateString
      };
    });

    return (
      <div className="bg-card dark:bg-card rounded-xl shadow-card p-4 mb-6 border border-border dark:border-border animate-slide-in-bottom">
        {/* Component content remains the same */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 text-card-foreground hover:text-primary dark:hover:text-primary-dark hover:bg-primary/5 dark:hover:bg-primary-dark/5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20"
            aria-label="Previous day"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center">
            <span className="text-xl font-bold text-card-foreground">
              {format(currentDateObj, 'MMMM yyyy')}
            </span>
          </div>

          <button
            onClick={() => navigateDate('next')}
            className="p-2 text-card-foreground hover:text-primary dark:hover:text-primary-dark hover:bg-primary/5 dark:hover:bg-primary-dark/5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20"
            aria-label="Next day"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {dateList.map((dateItem, index) => (
            <button
              key={dateItem.dateString}
              onClick={() => {
                setSelectedDate(dateItem.dateString);
                fetchMatches(dateItem.dateString);
              }}
              className={`flex flex-col items-center justify-center py-3 px-1 rounded-lg transition-all duration-200 animate-bounce-in ${dateItem.isSelected 
                ? 'bg-primary dark:bg-primary-dark text-white shadow-soft' 
                : 'hover:bg-primary/10 dark:hover:bg-primary-dark/10 text-card-foreground'}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className={`text-xs font-medium ${dateItem.isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>
                {dateItem.dayOfWeek}
              </span>
              <span className="text-lg font-bold mt-1">
                {dateItem.dayOfMonth}
              </span>
              <span className={`text-xs mt-1 ${dateItem.isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>
                {dateItem.isToday && (
                  <span className="inline-block px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-medium">
                    Today
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
        
        <div className="flex justify-between mt-4">
          <button
            onClick={() => navigateDate('today')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${format(new Date(), 'yyyy-MM-dd') === selectedDate 
              ? 'bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark cursor-default' 
              : 'bg-primary/5 text-primary hover:bg-primary/10 dark:bg-primary-dark/5 dark:text-primary-dark dark:hover:bg-primary-dark/10'}`}
            disabled={format(new Date(), 'yyyy-MM-dd') === selectedDate}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Today
            </div>
          </button>
          
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                const newDate = e.target.value;
                setSelectedDate(newDate);
                fetchMatches(newDate);
              }}
              className="px-4 py-2 border border-border dark:border-border rounded-lg bg-card dark:bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20 focus:border-primary dark:focus:border-primary-dark transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }, [selectedDate, navigateDate, fetchMatches]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 dark:from-background dark:via-background dark:to-background/90 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 bg-card dark:bg-card rounded-xl shadow-card p-6 border border-border dark:border-border animate-slide-in-bottom">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0 flex items-center">
              <div className="relative mr-4">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25"></div>
                <div className="relative bg-gradient-to-r from-primary to-secondary p-3 rounded-xl shadow-soft">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ScoureFootball
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Live football scores and results
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchMatches()}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center shadow-soft hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                disabled={isLoading || refreshing}
              >
                {refreshing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Scores
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Date Navigation */}
        {DateNavigationComponent}

        {/* Matches List */}
        <MatchesList 
          matches={matches} 
          isLoading={isLoading} 
          error={error} 
        />

        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-border dark:border-border animate-slide-in-bottom" style={{ animationDelay: '0.3s' }}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-card-foreground">ScoureFootball</p>
                <p className="text-xs text-muted-foreground">Live football scores and results</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} ScoureFootball. All rights reserved.</p>
              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                <span>Data sourced from</span>
                <span className="ml-1 font-medium text-primary dark:text-primary-dark">BeSoccer</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

// Main component with Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
