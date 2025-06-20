import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-float">
      <div className="relative bg-card dark:bg-card p-8 rounded-2xl shadow-card border border-danger/30 dark:border-danger/30 max-w-2xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-danger/5 to-danger/10 dark:from-danger/10 dark:to-danger/20 rounded-2xl"></div>
        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-1 bg-danger/20 rounded-full blur-sm"></div>
            <div className="relative bg-danger/10 dark:bg-danger/20 p-4 rounded-full">
              <svg className="h-10 w-10 text-danger dark:text-danger-dark" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-card-foreground mb-3">Error Loading Data</h3>
          <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-5 py-2.5 rounded-lg shadow-soft text-white bg-danger hover:bg-danger-dark focus:outline-none focus:ring-2 focus:ring-danger/20 focus:ring-offset-2 transition-all duration-200 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ErrorMessage);