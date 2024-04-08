import React from "react";
import { Box, Button, Grid, Typography } from "@mui/material";

export interface OnboardingCardProps {
  title: string;
  subtitle: string;
  ctaText: string;
  onClick?: () => void;
  ctaVariant?: "outlined" | "contained";
  background?: string;
}

const OnboardingCard: React.FC<OnboardingCardProps> = ({
                                                         title,
                                                         subtitle,
                                                         ctaText,
                                                         onClick,
                                                         ctaVariant = "outlined",
                                                         background
                                                       }) => {

  return (<Grid xs={12} md={6} sx={{ justifyContent: "center" }} display="flex" item>
    <Box p={4} sx={{
      background: background ? `url(${background})` : "",
      backgroundRepeat: "no-repeat",
      backgroundSize: { xs: "cover", lg: "contain" },
      flexGrow: 1,
      height: { xs: "580px", sm: "740px", md: "580px", lg: "740px" },
      maxWidth: "612px",
      borderRadius: "24px"
    }}>
      <Box display="flex" flexDirection="column" alignItems="flex-start" gap={3}>
        <Typography variant="h2">{title}</Typography>
        <Typography variant="subtitle1" sx={{ maxWidth: "265px" }}>{subtitle}</Typography>
        <Button onClick={onClick} variant={ctaVariant}>{ctaText}</Button>
      </Box>
    </Box>
  </Grid>);
};

export default OnboardingCard;
