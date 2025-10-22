import React from "react";
import { Box } from "@mui/material";

const PaymentCardSkeleton: React.FC = () => {
  return (
    <div className="md:border-t border-[#CDCFD3] pt-6 px-2 md:px-0 pb-6 w-full animate-pulse">
      <Box display="flex" flexDirection="column">
        {/* Header with icon and title */}
        <Box gap={2} mb={4} alignItems="center" display="flex">
          <div className="w-7 h-7 bg-gray-300 rounded"></div>
          <div className="flex-1 h-4 bg-gray-300 rounded w-64"></div>
        </Box>
        
        {/* Payment card content */}
        <Box className="bg-[#FAFAFB] rounded-lg p-6 space-y-6">
          {/* Payment method selection skeleton */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="h-12 bg-gray-300 rounded border border-gray-300"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-gray-300 rounded border border-gray-300"></div>
              <div className="h-12 bg-gray-300 rounded border border-gray-300"></div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="h-4 bg-gray-300 rounded w-40"></div>
            <div className="h-12 bg-gray-300 rounded border border-gray-300"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-gray-300 rounded border border-gray-300"></div>
              <div className="h-12 bg-gray-300 rounded border border-gray-300"></div>
            </div>
          </div>
        </Box>
      </Box>
    </div>
  );
};

export default PaymentCardSkeleton;