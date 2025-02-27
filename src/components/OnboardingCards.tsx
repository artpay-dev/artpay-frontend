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
        title="Potenzia la tua galleria con ArtPay."
        subtitle={
          <>
            Crea il tuo e-shop personalizzato e offri ai clienti diverse opzioni di pagamento rateale in un'unica piattaforma. Una soluzione completa per far crescere il tuo business nell'arte.
          </>
        }
        ctaVariant={isMobile ? 'contained' : 'outlined'}
        ctaText="Scopri ArtPay e iscriviti ora"
        sx={{ pr: { xs: 0, md: 1.5 } }}
        onClick={() => navigate("/artpay-per-gallerie")}
        background={bgOnboardingGallery}
      />

      <OnboardingCard
        title="Sei un collezionista?"
        subtitle={
          <>
            Accedi a opere uniche curate dai migliori galleristi. Scopri le opere dei tuoi artisti preferiti e acquista
            direttamente o con piani rateali. La tua collezione inizia qui! Iscriviti ora!
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
