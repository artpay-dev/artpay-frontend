import React from "react";
import { Box, BoxProps, Typography } from "@mui/material";
import SantanderCard from "./SantanderCard.tsx";

export interface LoanCardVerticalProps {
  sx?: BoxProps["sx"];
}

const LoanCardVertical: React.FC<LoanCardVerticalProps> = ({ sx = {} }) => {

  return (
    <Box
      sx={{
        //background: theme.palette.secondary.main,
        borderRadius: "24px",
        //border: "1px solid #d8ddfa",
        //px: { xs: 1, md: 5 },
        py: 0,
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexDirection: "column",
        ...sx
      }}
      display="flex">

      <Box sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        px: 5
      }}>
        <Typography fontWeight={500} variant="h5">
          Scegli tra i nostri partner
        </Typography>
        <Typography variant="body1">
          Ecco le migliori offerte di prestito provenienti dagli istituti bancari nostri partner. Scegli quella che
          preferisci e prosegui sulla pagina dedicata ad artpay sul sito dell’istituto finanziario selezionato, dove
          potrai personalizzare il prestito in ogni suo aspetto.
        </Typography>
        <Typography sx={{ opacity: 0.75 }} variant="body1">
          *la richiesta di prestito non garantisce la prenotazione dell'opera.”
        </Typography>
      </Box>

      <SantanderCard sx={{ width: "auto", p: 3, px: 5, mt: 3 }} background="#DDDDDD" />


    </Box>
  );
};

export default LoanCardVertical;
