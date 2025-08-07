import React from "react";
import DefaultLayout from "../components/DefaultLayout";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import NewsletterBig from "../components/NewsletterBig.tsx";
import { getDefaultPaddingX } from "../utils.ts";
import HeroHome from "../components/HeroHome.tsx";
import InfoCard from "../components/InfoCard.tsx";
import imgRocket from "../assets/images/rocket.svg";
import imgEye from "../assets/images/eye.svg";
import imgArtwork from "../assets/images/abstact-artwork.svg";
import OnboardingCards from "../components/OnboardingCards.tsx";

export interface HomeProps {}

const Home: React.FC<HomeProps> = ({}) => {
  const theme = useTheme();

  const px = getDefaultPaddingX();

  return (
    <DefaultLayout topBar={<HeroHome />} hasNavBar={false}>
      <Box sx={{ px: px, my: { xs: 6, md: 12 }, maxWidth: theme.breakpoints.values["xl"], ml: "auto", mr: "auto" }}>
        <Typography variant="display3" sx={{}}>
          Scopri l’eccellenza dei migliori galleristi italiani e le loro collezioni.
          <br />
          <br />
          Con ArtPay, l’arte è più vicina che mai. Naviga tra opere uniche, selezionate e certificate dai più rinomati
          galleristi italiani, e trova la tua opera preferita per iniziare o arricchire la tua collezione.
          <br />
          <br />
          Esplora l’arte con ArtPay!
        </Typography>
      </Box>
      <Box
        sx={{
          px: px,
          maxWidth: theme.breakpoints.values["xl"],
          ml: "auto",
          mr: "auto",
          gridTemplateColumns: { xs: undefined, sm: "1fr 1fr 1fr" },
          display: { xs: "flex", sm: "grid" },
          flexDirection: { xs: "column", sm: undefined },
          gap: 3,
        }}>
        <Box>
          <InfoCard
            title="Esplora le opere delle migliori gallerie d’arte italiane su Artpay!"
            subtitle="Artpay è partner delle più autorevoli gallerie italiane, per offrire in vendita una selezione unica di opere d&#39;arte, garantendo la qualità e l&#39;autenticità di ogni articolo presente sulla nostra piattaforma."
            imgSrc={imgEye}
          />
        </Box>
        <Box>
          <InfoCard
            title="Tecnologia innovativa per l’arte a portata di click!"
            subtitle="Artpay utilizza tecnologie all&#39;avanguardia per semplificare il processo di acquisto e vendita di opere d’arte, offrendo transazioni rapide, sicure e convenienti attraverso una piattaforma online facile e veloce da utilizzare."
            imgSrc={imgRocket}
          />
        </Box>
        <Box>
          <InfoCard
            title="Collezioni autorevoli"
            subtitle="Grazie alla partnership con le più autorevoli gallerie italiane, Artpay offre in acquisto e vendita online una selezione straordinaria di opere d&#39;arte curate, garantite e autenticate dai più rinomati galleristi."
            imgSrc={imgArtwork}
          />
        </Box>
      </Box>
      <OnboardingCards />
      <Grid sx={{ px: px, ml: "auto", mr: "auto", mb: 12 }} maxWidth="xl" container>
        <Grid mt={4} xs={12} item>
          <NewsletterBig title="Iscriviti ora per ricevere aggiornamenti esclusivi su Artpay direttamente nella tua casella di posta" />
        </Grid>
      </Grid>
    </DefaultLayout>
  );
};

export default Home;
