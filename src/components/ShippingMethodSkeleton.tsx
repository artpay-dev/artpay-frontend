import React from "react";
import { Box } from "@mui/material";

const ShippingMethodSkeleton: React.FC = () => {
  return (
    <div className="md:border-t border-[#CDCFD3] pt-6 px-2 md:px-0 pb-6 w-full animate-pulse">
      <Box display="flex" flexDirection="column">
        {/* Header with icon and title */}
        <Box gap={2} mb={4} alignItems="center" display="flex">
          <div className="w-7 h-7 bg-gray-300 rounded"></div>
          <div className="flex-1 h-4 bg-gray-300 rounded w-48"></div>
        </Box>
        
        {/* Shipping method options */}
        <div className="space-y-6">
          {/* First shipping method */}
          <div className="bg-[#FAFAFB] mb-6 p-6 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="w-4 h-4 bg-gray-300 rounded-full mt-1"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-3 bg-gray-300 rounded w-48"></div>
              </div>
            </div>
          </div>
          
          {/* Second shipping method */}
          <div className="bg-[#FAFAFB] mb-6 p-6 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="w-4 h-4 bg-gray-300 rounded-full mt-1"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-40"></div>
                <div className="h-3 bg-gray-300 rounded w-56"></div>
              </div>
            </div>
          </div>
        </div>
      </Box>
    </div>
  );
};

export default ShippingMethodSkeleton;