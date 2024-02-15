import React from "react";
import { Box, BoxProps, Button, Typography, useTheme } from "@mui/material";

export interface LoanConditionsCardProps {
  sx?: BoxProps["sx"];
}

const LoanConditionsCard: React.FC<LoanConditionsCardProps> = ({ sx }) => {
  const theme = useTheme();
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      py={3}
      px={14}
      sx={{ background: theme.palette.secondary.light, px: { xs: 3, sm: 6, md: 14 }, ...sx }}>
      <Box
        alignSelf="stretch"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ flexDirection: { xs: "column-reverse", sm: "row" } }}>
        <img style={{ height: "48px" }} src="/santander_logo_1.svg" />
        <img style={{ height: "30px" }} src="/best_choice.svg" />
      </Box>
      <Box
        mt={3}
        mb={1}
        py={2}
        display="flex"
        alignSelf="stretch"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ background: theme.palette.contrast.main, borderRadius: "5px" }}>
        <Typography sx={{ mb: 0.5 }} variant="body1">
          stima mensile a partire da..
        </Typography>
        <Typography sx={{ mb: 1 }} variant="h4" color="primary">
          120€ al mese
        </Typography>
      </Box>
      <Typography sx={{ mt: 1, mb: 2 }} variant="body2">
        TAEG: 5,91% (Indice sintetico di costo) / TAN: 5,74% (fisso nel tempo) / Spese iniziali: € 16,00
      </Typography>
      <Button variant="contained" href="https://santanderconsumergs.com/banking4you/" target="_blank">
        Richiedi preventivo
      </Button>
      <Typography sx={{ mt: 0.5 }} color="primary" variant="body1">
        Gratis e senza impegno
      </Typography>
    </Box>
  );
};

export default LoanConditionsCard;
