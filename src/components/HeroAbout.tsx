import React, { ReactNode } from "react";
import { Box, Button, Grid, Typography, useTheme } from "@mui/material";
import { getDefaultPaddingX } from "../utils.ts";

export interface HeroAboutProps {
  mainTitle?: string | ReactNode;
  description?: string | ReactNode;
  buttonText?: string;
  buttonAction?: () => void;
  imageSrc?: string;
}

const HeroAbout: React.FC<HeroAboutProps> = ({ mainTitle, description, buttonText, buttonAction, imageSrc }) => {
  const theme = useTheme();

  const px = getDefaultPaddingX();

  return <>
    <Box
      sx={{ background: theme.palette.primary.main, pt: { xs: 18, sm: 20, md: 24, lg: 24 } }}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center">
      <Grid maxWidth="xl" sx={{ pb: 12, px: px }} container>
        <Grid item xs={12} md={7} lg={6}>
          <Typography
            color={theme.palette.primary.contrastText}
            variant="display1">
            {mainTitle}
          </Typography>
        </Grid>
        <Grid display="flex" alignItems="center"
              mt={{ xs: 6, md: 0 }}
              justifyContent={{ xs: "flex-start", md: "center" }} item xs={12}
              md={5} lg={6}>
          <Box sx={{ maxWidth: "400px" }}>
            <Typography variant="subtitle1" color={theme.palette.primary.contrastText}>
              {description}
            </Typography>
            {(buttonText && buttonAction) &&
              <Button sx={{ mt: 3 }} onClick={buttonAction} color="contrast">{buttonText}</Button>}
          </Box>
        </Grid>
      </Grid>

    </Box>
    <Box
      sx={{
        background: `url(${imageSrc}) lightgray 50% / cover no-repeat`,
        backgroundPositionY: { xs: "top", md: "-60px", lg: "-80px" },
        height: { xs: "400px", sm: "540px", md: "600px", lg: "720px", xl: "800px" },
        marginLeft: "auto",
        marginRight: "auto"
        //maxWidth: "1440px"
      }}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center">
    </Box>
  </>;
};

export default HeroAbout;
