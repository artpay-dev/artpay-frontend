import React from "react";
import { Grid, GridProps, useMediaQuery, useTheme } from "@mui/material";
import { getDefaultPaddingX } from "../utils.ts";
import OnboardingCard from "./OnboardingCard.tsx";
import { useNavigate } from "../utils.ts";
import bgOnboardingGallery from "../assets/images/bg_onboarding_gallery.png";
import bgOnboardingCustomer from "../assets/images/bg_onboarding_customer.png";

export interface OnboardingCardsProps {
  sx?: GridProps["sx"];
}

const OnboardingCards: React.FC<OnboardingCardsProps> = ({ sx = {} }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const px = getDefaultPaddingX();

  return (
    <Grid
      sx={{ px: px, my: 9, ml: "auto", mr: "auto", maxWidth: theme.breakpoints.values["xl"], ...sx }}
      spacing={0}
      container>
      <OnboardingCard
        title="Sei un Gallerista?"
        subtitle={
          <>
            Crea il tuo e-shop personalizzato
            e offri ai tuoi Clienti diverse
            opzioni di pagamento rateale
            in un'unica piattaforma: loro
            pagheranno a rate, tu incassi
            subito l'intero importo.
          </>
        }
        ctaVariant={isMobile ? 'contained' : 'outlined'}
        ctaText="Vai al sito dedicato alle Gallerie"
        sx={{ pr: { xs: 0, md: 1.5 } }}
        onClick={() => window.location.href = "https://gallerie.artpay.art/"}
        background={bgOnboardingGallery}
      />

      <OnboardingCard
        title="Sei un collezionista?"
        subtitle={
          <>
            Naviga nella tua Galleria, scopri
            opere d'arte contemporanea di
            autori affermati ed emergenti,
            prenota l'opera che ti piace
            oppure acquistala subito
            scegliendo la frequenza di
            pagamento più comoda per te!
          </>
        }
        ctaVariant={isMobile ? 'contained' : 'outlined'}
        ctaText="Scopri di più"
        sx={{ pl: { xs: 0, md: 1.5 }, pt: { xs: 3, md: 0 } }}
        onClick={() => navigate("/artpay-per-collezionisti")}
        background={bgOnboardingCustomer}
      />
    </Grid>
  );
};

export default OnboardingCards;
