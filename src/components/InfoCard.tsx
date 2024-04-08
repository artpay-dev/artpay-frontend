import React, { ImgHTMLAttributes } from "react";
import { Box, Typography } from "@mui/material";

export interface InfoCardProps {
  title?: string;
  subtitle?: string;
  imgSrc?: ImgHTMLAttributes<any>["src"];
}

const InfoCard: React.FC<InfoCardProps> = ({ title, subtitle, imgSrc }) => {

  return (
    <Box sx={{ maxWidth: { xs: "auto", md: "342px" }, height: "100%", py: 3, px: { xs: 0, md: 3 } }}>
      <Box sx={{ height: "150px", mb: 6 }}>
        <img style={{ height: "100%" }} src={imgSrc} />
      </Box>
      <Typography sx={{ mb: 2, maxWidth: "280px" }} variant="h3">
        {title}
      </Typography>
      <Typography variant="subtitle1">{subtitle}</Typography>
    </Box>
  );
};

export default InfoCard;
