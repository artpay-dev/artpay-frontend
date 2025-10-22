import React from "react";
import { Box } from "@mui/material";

const ContactInfoSkeleton: React.FC = () => {
  return (
    <div className="md:border-t border-[#CDCFD3] pt-6 px-2 md:px-0 pb-6 w-full animate-pulse">
      <Box display="flex" flexDirection="column">
        {/* Header with icon and title */}
        <Box gap={2} mb={4} alignItems="center" display="flex">
          <div className="w-7 h-7 bg-gray-300 rounded"></div>
          <div className="flex-1 h-4 bg-gray-300 rounded w-52"></div>
          <div className="w-16 h-6 bg-gray-300 rounded"></div>
        </Box>
        
        {/* Login button skeleton */}
        <div className="max-w-80 h-12 bg-gray-300 rounded mb-6"></div>
        
        {/* Shipping data section */}
        <div className="bg-[#FAFAFB] p-4 rounded-lg mb-6">
          <div className="h-5 bg-gray-300 rounded w-32 mb-4"></div>
          
          {/* Address fields skeleton */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
        
        {/* Invoice toggle */}
        <div className="flex gap-2 my-6">
          <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
          <div className="h-4 bg-gray-300 rounded w-48"></div>
        </div>
        
        {/* Billing data section */}
        <div className="bg-[#FAFAFB] p-4 rounded-lg mt-6">
          <div className="h-5 bg-gray-300 rounded w-36 mb-4"></div>
          
          {/* Billing fields skeleton */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </Box>
    </div>
  );
};

export default ContactInfoSkeleton;