import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

export interface PromoSideProps {
  reverse?: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  imageSrc?: string;
}

const PromoSide: React.FC<PromoSideProps> = ({
                                               reverse = false,
                                               title = "Iscriviti alla piattaforma",
                                               subtitle = "Lorem ipsum dolor sit amet consectetur. Vitae vel sit sit dictum velit at erat.",
                                               description = "Lorem ipsum dolor sit amet consectetur. Vitae vel sit sit dictum velit at erat.",
                                               imageSrc = "/images/hero-side-example.png"
                                             }) => {
  const theme = useTheme();
  return (
    <Box display="flex" sx={{ flexDirection: { xs: "column", sm: reverse ? "row-reverse" : "row" } }}>
      <Box
        sx={{ background: "#010F22", minHeight: "500px", px: 6, maxWidth: { xs: "100vw", sm: "45vw" } }}
        display="flex"
        flexGrow={0.75}
        flexDirection="column"
        alignItems="center"
        justifyContent="center">
        <Box sx={{ maxWidth: "500px", alignItems: "center" }}>
          <Typography color={theme.palette.primary.contrastText} variant="h3">
            {title}
          </Typography>
          <Typography sx={{ mt: 6, maxWidth: "300px" }} color={theme.palette.primary.contrastText} variant="h6">
            {subtitle}
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: "320px" }} color={theme.palette.primary.contrastText} variant="body1">
            {description}
          </Typography>
        </Box>
      </Box>
      <Box
        flexGrow={1}
        sx={{ textAlign: reverse ? "right" : "left", maxWidth: { xs: "100vw", sm: "55vw" }, overflow: "hidden" }}>
        <img style={{ height: "100%" }} src={imageSrc} alt="Promotional Side" />
      </Box>
    </Box>
  );
};

export default PromoSide;
