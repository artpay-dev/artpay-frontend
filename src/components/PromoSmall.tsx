import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";

export interface PromoSmallProps {
  title: string;
  cta: string;
  onClick?: () => void;
  imgUrl?: string;
  contrast?: boolean;
}

const PromoSmall: React.FC<PromoSmallProps> = ({ title, cta, onClick, imgUrl, contrast = false }) => {
  const theme = useTheme();
  const textColor = contrast ? "white" : "textPrimary";
  const iconColor = contrast ? "contrast" : "";
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      className={`promoSmall ${contrast ? "promoSmall-contrast" : "promoSmall-standard"}`}
      gap={1}
      sx={{
        background: `url(${imgUrl})`,
        backgroundPosition: "center",
        backgroundColor: theme.palette.primary.main,
        height: "100px",
        cursor: "pointer",
      }}
      px={6}
      onClick={onClick}>
      <Typography sx={{ typography: { xs: "subtitle1" } }} color={textColor}>
        {title}
      </Typography>
      <Box display="flex" flexDirection="row" alignItems="center">
        <Typography sx={{ typography: { xs: "h5" } }} color={textColor}>
          {cta}
        </Typography>
        <ChevronRight color={iconColor} fontSize="large" />
      </Box>
    </Box>
  );
};

export default PromoSmall;
