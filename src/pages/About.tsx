import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import HeroAbout, { HeroAboutProps } from "../components/HeroAbout.tsx";
import { Box, Grid, GridProps, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useData } from "../hoc/DataProvider.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import imgLogo from "../assets/images/logo.svg";
import imgAboutCover from "../assets/images/hero-about-cover.webp";
import { getDefaultPaddingX } from "../utils.ts";
import PromoCard from "../components/PromoCard.tsx";
import OnboardingCards from "../components/OnboardingCards.tsx";
import NewsletterBig from "../components/NewsletterBig.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import EmailContactBox from "../components/EmailContactBox.tsx";

export interface AboutProps {
}


const About: React.FC<AboutProps> = ({}) => {
  const theme = useTheme();
  const data = useData();
  const auth = useAuth();
  const snackbar = useSnackbars();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [ready, setReady] = useState(false);
  // const [featuredArtworks, setFeaturedArtworks] = useState<ArtworkCardProps[]>();

  useEffect(() => {
    setReady(true);

  }, [data, snackbar]);

  const imgWidth = isMobile ? "100%" : `calc(100% - ${theme.spacing(6)})`;

  const px = getDefaultPaddingX();

  const heroContent: HeroAboutProps = {
    mainTitle: "Con Artpay l’arte è per tutti",
    description: <>Artpay è una start-up innovativa, fondata da un team di appassionati di arte ed esperti di
      tecnologia. Il nostro obiettivo è far incontrare online la domanda e l’offerta d’arte, rendendo la vendita (e
      l’acquisto) di opere più facile, veloce, sicuro e accessibile. Artpay permette alle gallerie più autorevoli di
      offrire in vendita online le proprie opere a un pubblico vasto di appassionati d’arte. Questi possono acquistare
      le opere di loro interesse in modo diretto o attraverso strumenti finanziari rateali, erogati da istituti bancari
      partner di Artpay.<br />
      La possibilità di poter acquistare opere attraverso strumenti finanziari rateali allarga in modo significativo la
      base di utenti, portando l’arte ben oltre i consueti circuiti del collezionismo, verso un pubblico più ampio,
      giovane e diversificato.<br /><br />
      Rivoluziona il mercato dell’arte con noi!
    </>,
    buttonText: "Entra nel mondo di artpay",
    imageSrc: imgAboutCover
  };

  const centeredGridSx: GridProps["sx"] = {
    marginLeft: "auto",
    marginRight: "auto",
    px: px,
    py: { xs: 6, md: 12 },
    position: "relative"
    //flexDirection: isMobile ? "column-reverse" : undefined,
  };

  return (
    <DefaultLayout pb={3} pageLoading={!ready} topBar={
      <HeroAbout {...heroContent} buttonAction={auth.isAuthenticated ? undefined : () => auth.login()} />
    } maxWidth="xl">

      <Grid sx={{ ...centeredGridSx, flexDirection: isMobile ? "column" : undefined }} container>
        <Grid xs={12} sm={4} lg={5} sx={{ pb: { xs: 3, sm: 0 }, height: "auto" }} item>
          <img
            style={{ width: imgWidth, maxWidth: "300px", minHeight: isMobile ? "70px" : undefined }}
            src={imgLogo}
          />
        </Grid>
        <Grid xs={12} sm={8} lg={7} item>
          <Typography variant="h2">
            La nostra missione è rendere l'arte accessibile a tutti, trasformando radicalmente il modo in cui le opere
            d'arte vengono scoperte, acquisite e apprezzate.<br /> Con Artpay, vogliamo connettere gallerie di fama
            mondiale,
            artisti emergenti e collezionisti ed appassionati, creando un ecosistema innovativo che celebra la diversità
            e l'unicità dell'arte contemporanea.<br />Siamo impegnati a fornire un'esperienza senza pari, dove la
            tecnologia
            incontra la creatività per ispirare e contribuire a trasformare il mercato dell'arte.
          </Typography>
          <Typography sx={{ mt: 6 }} variant="h4">
            Con il nostro approccio innovativo che offre anche sistemi di pagamento rateale integrati nella piattaforma,
            vogliamo abbattere le barriere finanziarie e consentire a chiunque, sia che desideri godersi un'opera per il
            puro piacere estetico che per investimento, di poter realizzare i propri sogni senza compromessi.
          </Typography>
        </Grid>
      </Grid>
      <Box display="flex" flexDirection="column" gap={3} sx={{ px: px }}>
        <PromoCard border title="Per le gallerie">
          <Typography variant="body1">
            Artpay è la soluzione che velocizza e semplifica il processo di vendita per i galleristi. Offriamo loro
            l'opportunità di ampliare la loro presenza online, raggiungendo un vasto pubblico di appassionati d'arte e
            collezionisti. La nostra piattaforma facilita le transazioni dirette e offre un supporto nella gestione
            delle approvazioni di finanziamento tramite i nostri partner. Collega la tua galleria al mondo dell'arte in
            modo rapido e agevole con Artpay.
          </Typography>
        </PromoCard>
        <PromoCard border title="Per gli appassionati d'arte">
          <Typography variant="body1">
            Artpay offre agli investitori e agli appassionati d'arte un accesso privilegiato al mondo dell'arte. Esplora
            una vasta selezione di opere curate dai migliori galleristi italiani e trova capolavori che soddisfino le
            tue ambizioni di investimento o semplicemente la tua passione per l'arte. Grazie alla nostra piattaforma, il
            processo di acquisto diventa rapido, semplice e sicuro, permettendo di connettersi direttamente con il
            mercato dell'arte. Acquista con fiducia e godi dell'opera immediatamente, senza barriere, con Artpay.
          </Typography>
        </PromoCard>
      </Box>
      <OnboardingCards sx={{ my: 8 }} />
      <Box sx={{ px: px }}>
        <NewsletterBig />
      </Box>
      <EmailContactBox />
    </DefaultLayout>
  );
};

export default About;
