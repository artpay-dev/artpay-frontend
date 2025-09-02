import React from "react";

const PersonalDataRowSkeleton: React.FC = () => {
  return (
    <div className="pb-6 flex justify-between items-center border-b border-[#CDCFD3] animate-pulse">
      <div className="space-y-4 flex-1">
        {/* Section title skeleton */}
        <div className="h-5 bg-gray-300 rounded w-48"></div>
        
        {/* Personal data list skeleton */}
        <div>
          <ul className="space-y-1">
            <li className="flex gap-2 leading-[125%]">
              <div className="h-4 bg-gray-300 rounded w-12"></div>
              <div className="h-4 bg-gray-300 rounded w-20"></div>
            </li>
            <li className="flex gap-2 leading-[125%]">
              <div className="h-4 bg-gray-300 rounded w-16"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </li>
            <li className="flex gap-2 leading-[125%]">
              <div className="h-4 bg-gray-300 rounded w-16"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Edit button skeleton */}
      <div className="h-10 bg-gray-300 rounded w-20 border border-gray-300"></div>
    </div>
  );
};

export default PersonalDataRowSkeleton;