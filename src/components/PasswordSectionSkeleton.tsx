import React from "react";

const PasswordSectionSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 pb-6 animate-pulse">
      {/* Section title skeleton */}
      <div className="h-5 bg-gray-300 rounded w-20"></div>
      
      {/* Password change form skeleton */}
      <div className="space-y-4">
        {/* Current password field */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-28"></div>
          <div className="h-12 bg-gray-300 rounded max-w-1/2"></div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* New password field */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-12 bg-gray-300 rounded "></div>
          </div>

          {/* Confirm password field */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-32"></div>
            <div className="h-12 bg-gray-300 rounded "></div>
          </div>
        </div>
        
        {/* Submit button skeleton */}
        <div className="h-12 bg-gray-300 rounded w-40"></div>
      </div>
    </div>
  );
};

export default PasswordSectionSkeleton;