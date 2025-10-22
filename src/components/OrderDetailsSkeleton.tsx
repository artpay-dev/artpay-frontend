import React from "react";
import { Box, Divider } from "@mui/material";

interface OrderDetailsSkeletonProps {
  orderMode?: "standard" | "loan" | "redeem" | "onHold";
  itemCount?: number;
}

const OrderDetailsSkeleton: React.FC<OrderDetailsSkeletonProps> = ({ 
  orderMode = "standard",
  itemCount = 1 
}) => {
  return (
    <div className="shadow-custom-variant pt-6 rounded-3xl px-10 pb-6 w-full animate-pulse h-fit">
      <Box display="flex" flexDirection="column">
        {/* Header with icon and title */}
        <Box gap={2} mb={4} alignItems="center" display="flex">
          <div className="w-7 h-7 bg-gray-300 rounded"></div>
          <div className="flex-1 h-4 bg-gray-300 rounded w-40"></div>
        </Box>
        
        {/* Order items skeleton */}
        <Box display="flex" flexDirection="column" gap={3} mt={3}>
          {Array.from({ length: itemCount }).map((_, index) => (
            <Box key={index} className="flex items-center w-full gap-4">
              {/* Item image skeleton */}
              <div className="w-16 h-16 bg-gray-300 rounded" style={{ minWidth: '64px' }}></div>
              
              {/* Item details skeleton */}
              <div className="space-y-1 flex-1">
                <div className="flex gap-2">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-28"></div>
              </div>
            </Box>
          ))}
        </Box>
        
        <Divider sx={{ my: 3, borderColor: "#d8ddfa" }} />
        
        {/* Price breakdown skeleton */}
        <Box display="flex" flexDirection="column" gap={2} sx={{ px: 2 }}>
          {orderMode === "loan" ? (
            <>
              {/* Loan mode pricing skeleton */}
              <Box display="flex" justifyContent="space-between">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <div className="h-4 bg-gray-300 rounded w-16"></div>
                <div className="h-4 bg-gray-300 rounded w-12"></div>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <div className="h-4 bg-gray-300 rounded w-14"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </Box>
            </>
          ) : (
            <>
              {/* Standard mode pricing skeleton */}
              <Box display="flex" justifyContent="space-between">
                <div className="h-5 bg-gray-300 rounded w-14"></div>
                <div className="h-5 bg-gray-300 rounded w-16"></div>
              </Box>
              
              {/* Shipping cost skeleton */}
              <Box display="flex" justifyContent="space-between">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-4 bg-gray-300 rounded w-12"></div>
              </Box>
              
              {/* Service fees skeleton */}
              <Box display="flex" justifyContent="space-between">
                <div className="h-4 bg-gray-300 rounded w-36"></div>
                <div className="h-4 bg-gray-300 rounded w-12"></div>
              </Box>
            </>
          )}
          
          {/* Privacy checkbox skeleton */}
          <div className="mt-6">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded mt-1"></div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-4 bg-gray-300 rounded w-40"></div>
              </div>
            </div>
          </div>
          
          {/* Checkout button skeleton */}
          <div className="h-14 bg-gray-300 rounded w-full mt-4"></div>
        </Box>
      </Box>
    </div>
  );
};

export default OrderDetailsSkeleton;