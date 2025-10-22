import React from "react";
import { Box } from "@mui/material";

const LoanBookingSkeleton: React.FC = () => {
  return (
    <Box 
      sx={{ borderTop: `1px solid #d8ddfa`, borderBottom: `1px solid #d8ddfa` }} 
      py={3} 
      mb={8} 
      className="animate-pulse"
    >
      {/* Title skeleton */}
      <div className="h-8 bg-gray-300 rounded mb-4 w-3/4"></div>
      
      {/* Description skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 rounded w-4/5"></div>
      </div>
    </Box>
  );
};

export default LoanBookingSkeleton;