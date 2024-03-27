import React from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Button, Grid, Link, Typography } from "@mui/material";
import PromoCard from "./PromoCard.tsx";
import reservationBackground from "../assets/images/reservation-box-background.png";
import onboardingBackground from "../assets/images/background-onboarding.svg";

import onboardingImg1 from "../assets/images/gallery-onboarding-img-1.png";
import onboardingImg2 from "../assets/images/gallery-onboarding-img-2.png";

export interface GalleryOnboardingProps {

}

const GalleryOnboarding: React.FC<GalleryOnboardingProps> = ({}) => {
  const px = { xs: 0, md: 4, lg: 14 };
  return (<DefaultLayout>
    <Grid sx={{ mt: 18, px: px }} container>
      <Grid item xs={12} md={7}>
        <Typography variant="body1" color="primary" sx={{ textTransform: "uppercase" }}>Artpay per gallerie</Typography>
        <Typography variant="display1" color="primary" sx={{ mt: 1 }}>
          Artpay per gallerie Lorem ipsum dolor sit amet, conetur adipiscing elit, sed do eiusmod.
        </Typography>
        <Typography variant="body1" sx={{ mt: 6 }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.</Typography>
      </Grid>
      <Grid item xs={12} md={5} sx={{ pl: 8, pt: 9, minHeight: "720px" }}>
        <Box sx={{ position: "relative" }}>
          <img style={{ position: "absolute", top: 0, left: 0, zIndex: 2 }}
               src={onboardingImg1} />
          <img style={{ position: "absolute", top: "104px", left: "168px" }}
               src={onboardingImg2} />
        </Box>
      </Grid>
    </Grid>
    <Box sx={{ py: 12, background: `url(${onboardingBackground})`, px: px }}>
      <Box display="flex" flexDirection="column" gap={3}>
        <PromoCard border title={<>Iscriviti<br />ad artpay</>}>
          <Typography variant="body1">La tua area riservata sarà attiva entro 2 giorni lavorativi a partire dalla firma
            del contratto. Un team a tua disposizione sarà pronto a supportarti in caso di necessità.
          </Typography>
          <Button variant="contained" sx={{ mt: 3 }}>Inizia ora</Button>
        </PromoCard>
        <PromoCard title={<>Onboarding<br />e caricamento opere</>}>
          <Typography variant="body1">Accettate le condizioni contrattuali, sarai invitatə alla registrazione della tua
            galleria. Potrai accedere allʼarea riservata e inserire le opere da mettere in vendita, scegliendo se
            rendere pubblici o meno prezzi ed informazioni.
          </Typography>
        </PromoCard>
        <PromoCard title={<>Inizia a<br />vendere</>}>
          <Typography variant="body1">Vendi le tue opere online e in galleria in modo semplice e sicuro. Potrai proporre
            ai tuoi collezionisti lʼacquisto rateale in pochi click e con esito dalle 2 alle 24 ore. Direttamente dalla
            piattaforma, sempre sotto il tuo controllo.
          </Typography>
        </PromoCard>
        <PromoCard title="Ancora dubbi?" variant="contrast">
          <Button variant="outlined" color="contrast">Scrivici su Whatsapp</Button>
          <Button variant="outlined" color="contrast" sx={{ ml: 3 }}>Scrivi a hello@artpay.art</Button>
        </PromoCard>
      </Box>
    </Box>
    <Grid sx={{ py: 12, px: px }} container>
      <Grid item xs={12} md={6} display="flex" alignItems="center">
        <Box sx={{ maxWidth: "400px" }} display="flex" flexDirection="column" alignItems="flex-start">
          <Typography variant="display3">Entra a far parte di artpay</Typography>
          <Typography sx={{ my: 6 }} variant="body1">Compila il form e raccontaci il tuo businesss</Typography>
          <Button sx={{ mb: 2 }} variant="contained">Scrivi a hello@artpay.art</Button>
          <Link color="primary">Consulta le FAQ</Link>
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box sx={{ background: `url(${reservationBackground})`, height: "612px" }} display="flex"
             flexDirection="column"
             alignItems="center" justifyContent="center">
          <Typography>Programma una consulenza con artpay</Typography>
          <Button sx={{ mt: 4, mb: 2 }} variant="contained">Inizia ora</Button>
          <Typography>Takes 2 minutes</Typography>
        </Box>
        <Button variant="outlined" sx={{ mt: 3 }} fullWidth>oppure prenota una chiamata subito</Button>
      </Grid>

    </Grid>
  </DefaultLayout>);
};

export default GalleryOnboarding;
