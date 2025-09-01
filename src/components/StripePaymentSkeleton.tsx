import React from "react";
import { Box } from "@mui/material";

const StripePaymentSkeleton: React.FC = () => {
  return (
    <Box className="animate-pulse mb-12">
      <div className="bg-[#FAFAFB] rounded-lg p-6 space-y-6">
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
      </div>
    </Box>
  );
};

export default StripePaymentSkeleton;