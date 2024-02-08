import React, { ReactNode } from "react";
import { Box, Paper, PaperProps, Typography } from "@mui/material";

export interface ContentCardProps {
  icon?: ReactNode;
  title: string;
  children?: ReactNode | ReactNode[];
  headerButtons?: ReactNode[];
  contentPadding?: number;
  contentPaddingMobile?: number;
  sx?: PaperProps["sx"];
}

const ContentCard: React.FC<ContentCardProps> = ({
  icon,
  title,
  headerButtons = [],
  children,
  contentPadding = 5,
  contentPaddingMobile = 3,
  sx,
}) => {
  // const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ border: "1px solid #d8ddfa", ...sx }}>
      <Box display="flex" pb={2} flexDirection="column">
        <Box gap={2} mb={1} p={2} alignItems="center" display="flex">
          {icon}
          <Typography sx={{ flexGrow: 1 }} variant="subtitle1">
            {title}
          </Typography>
          <Box>{headerButtons}</Box>
        </Box>
        <Box sx={{ px: { xs: contentPaddingMobile, md: contentPadding } }}>{children}</Box>
      </Box>
    </Paper>
  );
};

export default ContentCard;
