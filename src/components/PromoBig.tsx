import React from "react";
import { Box, Button, Grid, SxProps, Theme, Typography, useMediaQuery, useTheme } from "@mui/material";
import DisplayImage from "./DisplayImage.tsx";

export interface HeroArtworkProps {
  sx?: SxProps<Theme>;
  title: string;
  subtitle: string;
  cta: string;
  imgUrl?: string;
  onClick?: () => void;
}

const PromoBig: React.FC<HeroArtworkProps> = ({ sx = {}, cta, imgUrl, title, subtitle, onClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const textColor = theme.palette.primary.contrastText;

  return (
    <Grid
      sx={{
        width: "100%",
        background: theme.palette.primary.main,
        p: { xs: 2, md: 6 },
        flexDirection: { xs: "column-reverse", md: "row" },
        ...sx,
      }}
      container>
      <Grid xs={12} md={6} sx={{ pr: { xs: 0, md: 4 } }} item>
        <Box
          sx={{
            minHeight: { xs: "auto", md: "550px" },
            borderRadius: "5px",
            background: imgUrl ? "" : theme.palette.primary.light,
            pt: { xs: 3, md: 0 },
          }}>
          {imgUrl && <DisplayImage src={imgUrl} height={isMobile ? "auto" : 550} width={isMobile ? "100%" : 550} />}
        </Box>
      </Grid>
      <Grid xs={12} md={6} px={4} display="flex" flexDirection="column" justifyContent="center" item>
        <Typography variant="h2" color={textColor}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ mt: 3 }} color={textColor}>
          {subtitle}
        </Typography>
        <Box mt={3}>
          <Button color="contrast" onClick={onClick}>
            {cta}
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};

export default PromoBig;
