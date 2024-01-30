import React, { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";

export interface ContentCardProps {
  icon?: ReactNode;
  title: string;
  children?: ReactNode | ReactNode[];
  headerButtons?: ReactNode[];
}

const ContentCard: React.FC<ContentCardProps> = ({ icon, title, headerButtons = [], children }) => {
  // const theme = useTheme();
  return (
    <Paper elevation={1}>
      <Box display="flex" p={2} flexDirection="column">
        <Box gap={2} mb={3} alignItems="center" display="flex">
          {icon}
          <Typography sx={{ flexGrow: 1 }} variant="subtitle1">
            {title}
          </Typography>
          <Box>{headerButtons}</Box>
        </Box>
        <Box px={3}>{children}</Box>
      </Box>
    </Paper>
  );
};

export default ContentCard;
