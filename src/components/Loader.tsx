import React from "react";
import { Box, BoxProps, LinearProgress, Typography } from "@mui/material";

export interface LoaderProps {
  sx?: BoxProps["sx"];
}

const Loader: React.FC<LoaderProps> = ({ sx }) => {
  return (
    <Box sx={{ ...sx }}>
      <Typography variant="h6">Loading...</Typography>
      <LinearProgress />
    </Box>
  );
};

export default Loader;
