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
      sx={{
        height: { xs: "auto", md: height },
        gridAutoFlow: { xs: undefined, md: "column" },
        gridTemplateColumns: { xs: undefined, md: "1fr 1fr" },
        display: { xs: "flex", md: "grid" },
        flexDirection: { xs: "column", md: undefined },
        gap: { xs: 3, md: undefined },
      }}
      display="grid"
      alignItems="stretch">
      <Box
        sx={{ overflow: "hidden", height: { xs: "auto", md: height } }}
        gap={2}
        display="flex"
        flexDirection="column"
        justifyContent="flex-start">
        <Typography sx={{ typography: { xs: "h3", md: "h1" } }} color="white" onClick={onClick}>
          {title}
        </Typography>
        <Typography sx={{ typography: { xs: "h6", md: "subtitle1" } }} color="white" onClick={onClick}>
          {subtitle}
        </Typography>
      </Box>
      <Box
        onClick={onClick}
        sx={{
          overflow: "hidden",
          height: { xs: "250px", sm: "450px", md: height },
          display: "grid",
          alignItems: "center",
          justifyItems: "center",
          textAlign: "center",
        }}>
        <img src={imgUrl} style={{ maxHeight: "100%", maxWidth: "100%" }} />
      </Box>
    </Box>
  );
};

export default HeroSlide;
