import React from "react";
import { Box, BoxProps, Typography } from "@mui/material";

export interface ListHeaderProps {
  title: string;
  subtitle: string;
  boxSx?: BoxProps["sx"];
}

const ListHeader: React.FC<ListHeaderProps> = ({ title, subtitle, boxSx = {} }) => {
  return (
    <Box sx={{ px: { xs: 0, md: 6 }, ...boxSx }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Typography variant="body1" sx={{ mb: 6 }}>
        {subtitle}
      </Typography>
    </Box>
  );
};

export default ListHeader;
