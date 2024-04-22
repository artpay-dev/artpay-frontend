import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

export interface AvatarCircleTextProps {
  text?: string;
}

const AvatarCircleText: React.FC<AvatarCircleTextProps> = ({ text = "" }) => {
  const theme = useTheme();
  return (<Box sx={{
    height: "48px",
    width: "48px",
    p: 1,
    borderRadius: "24px",
    border: "1px solid #CDCFD3",
    background: theme.palette.primary.main
  }} display="flex" alignItems="center" justifyContent="center">
    <Typography color="white">{text}</Typography>
  </Box>);
};

export default AvatarCircleText;
