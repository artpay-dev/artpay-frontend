import React from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";

export interface HeroAboutProps {
  subtitle?: string;
  mainTitle?: string;
  description?: string;
  buttonText?: string;
  imageSrc?: string;
}

const HeroAbout: React.FC<HeroAboutProps> = ({ subtitle, mainTitle, description, buttonText, imageSrc }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{ background: theme.palette.primary.main, pt: { xs: 8, md: 16, lg: 24 }, pb: 6 }}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center">
      <Box sx={{ maxWidth: theme.breakpoints.values["xl"], px: { xl: 6, sm: 4, xs: 3 } }} mb={6}>
        <Typography sx={{ maxWidth: "530px", mb: 3 }} color={theme.palette.primary.contrastText} variant="h6">
          {subtitle}
        </Typography>
        <Typography
          sx={{ fontSize: { xs: "3rem", sm: "6rem", md: "8rem", lg: "10rem", xl: "12rem" } }}
          color={theme.palette.primary.contrastText}
          variant="h1">
          {mainTitle}
        </Typography>
      </Box>
      <img style={{ maxWidth: "100%" }} src={imageSrc} alt="Hero About" />
      <Box sx={{ width: "100%", maxWidth: theme.breakpoints.values["xl"], px: { xl: 6, sm: 4, xs: 3 } }}>
        <Typography variant="h4" sx={{ maxWidth: "1046px", mb: 3, mt: 12 }} color={theme.palette.primary.contrastText}>
          {description}
        </Typography>
        <Button color="contrast">{buttonText}</Button>
      </Box>
    </Box>
  );
};

export default HeroAbout;
