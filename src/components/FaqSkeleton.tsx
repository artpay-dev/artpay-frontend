import React from 'react';

const FaqSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Skeleton per il titolo principale */}
      <div className="h-8 bg-gray-200 rounded-md w-1/3 animate-pulse"></div>

      {/* Skeleton per le FAQ */}
      {[1, 2, 3, 4, 5].map((index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
          {/* Skeleton per la domanda */}
          <div className="flex items-center justify-between">
            <div className="h-5 bg-gray-200 rounded animate-pulse flex-1 mr-4"></div>
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Skeleton per la risposta (mostrato solo in alcune per variazione) */}
          {index % 2 === 0 && (
            <div className="space-y-2 pt-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FaqSkeleton;