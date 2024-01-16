import React from "react";
import { Box, Typography } from "@mui/material";

export interface HeroSlideItem {
  imgUrl: string;
  title: string;
  subtitle: string;
}
export interface HeroSlideProps extends HeroSlideItem {
  onClick?: () => void;
}

const HeroSlide: React.FC<HeroSlideProps> = ({ title, subtitle, imgUrl, onClick }) => {
  const height = "450px";
  return (
    <Box
      sx={{ height: height, gridAutoFlow: "column", gridTemplateColumns: "1fr 1fr" }}
      display="grid"
      alignItems="stretch">
      <Box
        sx={{ overflow: "hidden", height: height }}
        gap={2}
        display="flex"
        flexDirection="column"
        justifyContent="flex-start">
        <Typography variant="h1" color="white" onClick={onClick}>
          {title}
        </Typography>
        <Typography variant="subtitle1" color="white" onClick={onClick}>
          {subtitle}
        </Typography>
      </Box>
      <Box onClick={onClick} sx={{ overflow: "hidden", height: height, textAlign: "center" }}>
        <img src={imgUrl} style={{ height: "100%", maxWidth: "100%" }} />
      </Box>
    </Box>
  );
};

export default HeroSlide;
