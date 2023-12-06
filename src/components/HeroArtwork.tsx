import React from "react";
import {
  Box,
  Button,
  Grid,
  SxProps,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";

export interface HeroArtworkProps {
  sx?: SxProps<Theme>;
  title: string;
  subtitle: string;
  cta: string;
  onClick?: () => void;
}

const HeroArtwork: React.FC<HeroArtworkProps> = ({
  sx = {},
  cta,
  title,
  subtitle,
  onClick,
}) => {
  const theme = useTheme();
  const textColor = theme.palette.primary.contrastText;

  return (
    <Grid
      sx={{
        width: "100%",
        background: theme.palette.primary.main,
        p: { xs: 2, md: 6 },
        ...sx,
      }}
      container>
      <Grid xs={12} md={6} pr={4} item>
        <Box
          sx={{
            minHeight: { xs: "auto", md: "550px" },
            borderRadius: "5px",
            background: theme.palette.primary.light,
          }}></Box>
      </Grid>
      <Grid
        xs={12}
        md={6}
        px={4}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        item>
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

export default HeroArtwork;
