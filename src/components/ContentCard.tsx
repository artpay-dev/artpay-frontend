import React, { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";

export interface ContentCardProps {
  icon?: ReactNode;
  title: string;
}

const ContentCard: React.FC<ContentCardProps> = ({ icon, title }) => {
  return (
    <Paper>
      <Box display="flex" p={2} flexDirection="column">
        <Box gap={2} display="flex">
          {icon}
          <Typography variant="subtitle1">{title}</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ContentCard;
