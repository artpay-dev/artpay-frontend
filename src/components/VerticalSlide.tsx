import React from "react";
import { Box, Button, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Cta } from "../types/ui.ts";

export interface VerticalSlideProps {
  title: string;
  imgSrc: string;
  text: string;
  cta?: Cta;
}

const VerticalSlide: React.FC<VerticalSlideProps> = ({ title, text, imgSrc, cta }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // , maxWidth: "620px"
  return (<Grid sx={{ height: isMobile ? undefined : "100%", background: "#E5E7E9" }} container>
    <Grid xs={12} md={7} sx={{ background: isMobile ? "none" : theme.palette.primary.main }} item>
      <img style={{ width: "100%" }} src={imgSrc} />
    </Grid>
    <Grid display="flex" alignItems="center" px={6} pb={6} item>
      <Box sx={{ maxWidth: isMobile ? "100%" : "240px" }}>
        <Typography variant="h1">{title}</Typography>
        {cta && <Button href={cta.link} sx={{ my: 3 }} variant="contained">{cta.text}</Button>}
        <Typography variant="body1">{text}</Typography>
      </Box>
    </Grid>
  </Grid>);
};

export default VerticalSlide;
