import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Loading...' 
}) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-float">
      <div className="relative bg-card dark:bg-card p-8 rounded-2xl shadow-card border border-border dark:border-border mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-2xl"></div>
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-primary to-secondary animate-spin opacity-25`}></div>
            <div className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-4 border-t-transparent border-primary dark:border-primary-dark animate-spin`}></div>
          </div>
          {message && (
            <div className="mt-6 text-center">
              <p className="text-card-foreground font-medium mb-3">{message}</p>
              <div className="flex justify-center">
                <span className="h-2 w-2 bg-primary dark:bg-primary-dark rounded-full animate-pulse-fast"></span>
                <span className="h-2 w-2 bg-primary dark:bg-primary-dark rounded-full animate-pulse-fast mx-1.5" style={{ animationDelay: '0.2s' }}></span>
                <span className="h-2 w-2 bg-primary dark:bg-primary-dark rounded-full animate-pulse-fast" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;