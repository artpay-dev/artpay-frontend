import React from "react";
import { Box } from "@mui/material";

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}>
      {value === index && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{ py: { xs: 3, md: 6 } }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default TabPanel;
