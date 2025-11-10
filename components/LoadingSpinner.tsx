import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-2 animate-pulse p-4 mt-8">
      <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
      <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
      <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
      <span className="text-amber-300 text-lg">Analyzing...</span>
    </div>
  );
};

export default LoadingSpinner;