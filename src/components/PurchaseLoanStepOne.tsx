import React from "react";
import { Box, Button, Grid, Typography, useTheme } from "@mui/material";
import InfoCard from "./InfoCard.tsx";

export interface PurchaseLoanStepOneProps {
  onClick?: () => void;
}

const PurchaseLoanStepOne: React.FC<PurchaseLoanStepOneProps> = ({ onClick }) => {
  const theme = useTheme();

  const maxWidth = `${theme.breakpoints.values.xl}px`;

  return (
    <Grid sx={{ maxWidth: maxWidth, ml: "auto", mr: "auto", px: { xs: 3, md: 6 }, gap: { xs: 3, md: 0 } }} container>
      <Grid xs={12} mb={6} item>
        <Typography sx={{ mb: { xs: 2 }, typography: { xs: "h4", sm: "h3" } }} variant="h3">
          Non vuoi farti sfuggire l’opera? Bloccala!
        </Typography>
        <Typography variant="subtitle1">
          Se sei intenzionato a richiedere un finanziamento, ti consigliamo di bloccare l'opera per non fartela
          scappare!
        </Typography>
      </Grid>
      <Grid
        xs={12}
        sx={{
          gridTemplateColumns: { xs: undefined, md: "1fr 1fr 1fr" },
          display: { xs: "flex", md: "grid" },
          flexDirection: { xs: "column", md: undefined },
          gap: 3,
        }}
        item>
        <Box>
          <InfoCard
            title="Versa un acconto"
            subtitle="Questa operazione blocca l'opera e garantisce l'esclusiva sull'acquisto. Alla ricezione dell'acconto Artpay bloccherà l'opera per 7 giorni."
            imgSrc="/boat.svg"
          />
        </Box>
        <Box>
          <InfoCard
            title="Richiedi il finanziamento"
            subtitle="Normalmente viene erogato in poche ore*."
            imgSrc="/boat.svg"
          />
        </Box>
        <Box>
          <InfoCard
            title="Compra l’opera d’arte"
            subtitle="Completato l'iter di richiesta e ricevuto il finanziamento, l'acquirente può procedere all'acquisto dell'opera dal sito Artpay"
            imgSrc="/boat.svg"
          />
        </Box>
      </Grid>

      <Grid xs={12} my={6} p={`0!important`} display="flex" flexDirection="column" alignItems="center" item>
        <Button onClick={onClick} variant="contained">
          Blocca l'opera
        </Button>
        <Typography sx={{ mt: 1 }} variant="body2">
          *L'erogazione del finanziamento dipende dalle garanzie fornite dal richiedente e dai tempi di risposta della
          finanziaria
        </Typography>
      </Grid>
    </Grid>
  );
};

export default PurchaseLoanStepOne;
