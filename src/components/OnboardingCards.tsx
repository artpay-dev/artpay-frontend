import React from "react";
import { Grid, GridProps, useTheme } from "@mui/material";
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

  const px = getDefaultPaddingX();

  return (
    <Grid sx={{ px: px, my: 9, ml: "auto", mr: "auto", maxWidth: theme.breakpoints.values["xl"], ...sx }} spacing={0}
          container>
      <OnboardingCard title="Sei un gallerista?"
                      subtitle={<>Iscriviti ad Artpay e trasforma la tua galleria in un punto di riferimento globale
                        online e offline.<br />
                        Potrai accedere a strumenti esclusivi, facili e immediati, per ampliare la presenza della tua
                        galleria sul mercato, raggiungere nuovi clienti online, VENDERE PIÙ OPERE e
                        massimizzare i tuoi guadagni.<br />
                        Il futuro dell&#39;arte è adesso. Approfittane!</>}
                      ctaText="Scopri di più"
                      sx={{ pr: { xs: 0, md: 1.5 } }}
                      onClick={() => navigate("/artpay-per-gallerie")}
                      background={bgOnboardingGallery} />

      <OnboardingCard title="Sei un appassionato d’arte?"
                      subtitle={<>Esplora il mondo dell&#39;arte come mai prima d&#39;ora, con Artpay!<br />
                        Accedi a una selezione esclusiva di opere curate dai principali galleristi italiani. Entra nel
                        cuore dell&#39;arte contemporanea, SCOPRI E ACQUISTA CAPOLAVORI UNICI, direttamente o con piani
                        rateali personalizzati.<br />
                        La tua collezione d’arte inizia qui, con Artpay. Iscriviti subito e scopri un nuovo modo di
                        vivere l’arte.
                      </>}
                      ctaText="Scopri di più"
                      sx={{ pl: { xs: 0, md: 1.5 }, pt: { xs: 3, md: 0 } }}
                      onClick={() => navigate("/artpay-per-collezionisti")}
                      background={bgOnboardingCustomer} />
    </Grid>);
};

export default OnboardingCards;
