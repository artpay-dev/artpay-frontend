import React from "react";

const GenericPageSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Page title skeleton */}
      <div className="h-14 bg-gray-300 rounded w-80 mb-12"></div>
      
      {/* Content section with border top */}
      <div className="border-t border-[#CDCFD3] pt-12">
        {/* Content placeholder - you can add more specific content skeletons here */}
        <div className="space-y-6">
          <div className="h-6 bg-gray-300 rounded w-48"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-300 rounded"></div>
            <div className="h-12 bg-gray-300 rounded"></div>
            <div className="h-12 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericPageSkeleton;