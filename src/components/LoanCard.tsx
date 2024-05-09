import React from "react";
import { Box, BoxProps, Button, Typography, useTheme } from "@mui/material";
import santanderLogo from "../assets/images/santander_logo_1.svg";

export interface LoanCardProps {
  sx?: BoxProps["sx"];
}

const LoanCard: React.FC<LoanCardProps> = ({ sx = {} }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        background: theme.palette.secondary.main,
        borderRadius: "24px",
        px: { xs: 4, md: 8, lg: 13 },
        py: 5,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: { xs: "column", md: "row" },
        ...sx
      }}
      display="flex">
      <Box sx={{
        maxWidth: { xs: undefined, md: "450px", lg: "500px" },
        display: "flex",
        flexDirection: "column",
        pr: { xs: 0, md: 3 },
        gap: 3
      }}>
        <Typography fontWeight={500} color="white" variant="h3">
          Scegli tra i nostri partner
        </Typography>
        <Typography color="white" variant="body1">
          Ecco le migliori offerte di prestito provenienti dagli istituti bancari nostri partner. Scegli quella che
          preferisci e prosegui sulla pagina dedicata ad artpay sul sito dell’istituto finanziario selezionato, dove
          potrai personalizzare il prestito in ogni suo aspetto.
        </Typography>
        <Typography color="white" sx={{ opacity: 0.75 }} variant="body1">
          *la richiesta di prestito non garantisce la prenotazione dell'opera.”
        </Typography>
      </Box>
      <Box
        sx={{
          background: "#F5F5F5",
          borderRadius: "24px",
          width: { xs: "auto", md: "400px" },
          p: 3,
          mt: { xs: 10, md: 0 }
        }}>
        <img style={{ height: "24px" }} src={santanderLogo} />
        <Box sx={{ background: theme.palette.common.white, py: 2, textAlign: "center" }} mt={3} mb={2}>
          <Typography fontWeight={500} variant="body1">
            prestiti fino a
          </Typography>
          <Typography fontWeight={500} variant="h3" color="primary">
            30.000€
          </Typography>
        </Box>
        <Button fullWidth sx={{ textAlign: "center" }} href="https://www.santanderconsumer.it/prestito/partner/artpay"
                target="_blank" variant="contained">
          Calcola la rata
        </Button>
        <Typography sx={{ textAlign: "center", width: "100%", mt: 1 }} fontWeight={500} variant="caption">
          Gratis e senza impegno
        </Typography>
        <Typography sx={{ textAlign: "center", width: "100%", fontSize: "10px", mt: 3 }} variant="caption">
          Annuncio pubblicitario con finalità promozionale. Per tutte le condizioni contrattuali ed economiche
          consultare le «Informazioni europee di base sul credito ai consumatori» disponibile presso gli Agenti della
          Banca e sulla sezione Trasparenza del sito www.santanderconsumer.it Salvo approvazione Santander Consumer
          Bank.
        </Typography>
      </Box>
    </Box>
  );
};

export default LoanCard;
