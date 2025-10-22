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
          artpay è dedicata a tutti i protagonisti della compravendita d'arte e dei beni da collezionismo: Gallerie,
          Case d'Asta, collezionisti e artisti.
          <br />
          <br />
          artpay avvicina i nuovi collezionisti all'arte, rendendola accessibile grazie a soluzioni di pagamento comode
          e personalizzate.
          <br />
          <br />
          artpay sviluppa il business di Gallerie e Case d'Asta, allargando la loro platea di collezionisti, migliorando
          i loro flussi di cassa, aumentando la rotazione e la frequenza d'acquisto.
        </Typography>
      </Box>
      <Box sx={{ px: px, my: { xs: 3, md: 6 }, maxWidth: theme.breakpoints.values["xl"], ml: "auto", mr: "auto" }}>
        <Typography variant="h2">Scegli la tua nuova opera d'arte.</Typography>
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
            title="La tua Galleria preferita
            da navigare col tuo
            smartphone!"
            subtitle="artpay sta cambiando il
            mondo della compravendita
            d'arte: registrati su artpay
            oppure chiedi alla tua
            Galleria di invitarti e naviga
            comodamente tra le
            opere dal tuo telefono."
            imgSrc={imgEye}
          />
        </Box>
        <Box>
          <InfoCard
            title="Acquista oggi, goditi
            subito l'opera e pagala
            nel tempo!"
            subtitle="Con artpay puoi prenotare
            l'opera che ti interessa
            oppure acquistarla subito
            scegliendo il piano di
            rateizzazione offerto dai
            partner finanziari artpay
            più comodo per te."
            imgSrc={imgArtwork}
          />
        </Box>
        <Box>
          <InfoCard
            title="100% sicura, 100%
            semplice, 100% comoda:
            l'arte a portata di click!"
            subtitle="artpay è la piattaforma
            digitale che integrai
            metodi di pagamento dei
            propri partner utilizzando
            i protocolli di sicurezza
            più avanzati, offrendoti
            sempre un'esperienza
            appagante e coinvolgente."
            imgSrc={imgRocket}
          />
        </Box>
      </Box>
      <OnboardingCards />
      <Grid sx={{ px: px, ml: "auto", mr: "auto", mb: 12 }} maxWidth="xl" container>
        <Grid mt={4} xs={12} item>
          <NewsletterBig title="Iscriviti ora per
                          ricevere
                          aggiornamenti
                          esclusivi su artpay
                          direttamente nella tua
                          casella di posta." />
        </Grid>
      </Grid>
    </DefaultLayout>
  );
};

export default Home;
