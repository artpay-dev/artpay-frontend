import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

export interface InfoCardProps {
  title?: string;
  subtitle?: string;
  imgSrc?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, subtitle, imgSrc }) => {
  const theme = useTheme();
  return (
    <Box sx={{ minHeight: "496px", background: theme.palette.secondary.light, px: 3, pt: 3 }}>
      <Box sx={{ height: "150px", mb: 6 }}>
        <img style={{ height: "100%" }} src={imgSrc} />
      </Box>
      <Typography sx={{ mb: 2, maxWidth: "280px" }} variant="h4">
        {title}
      </Typography>
      <Typography variant="h6">{subtitle}</Typography>
    </Box>
  );
};

export default InfoCard;
