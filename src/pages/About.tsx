import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import HeroAbout, { HeroAboutProps } from "../components/HeroAbout.tsx";
import { Box, Grid, GridProps, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useData } from "../hoc/DataProvider.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import imgLogo from "../assets/images/logo.svg";
import imgAboutCover from "../assets/images/hero-about-cover.webp";
import { getDefaultPaddingX } from "../utils.ts";
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
    description: (
      <>
        Artpay è una start-up innovativa, fondata da un team di appassionati di arte ed esperti di tecnologia nel 2023.
        Il nostro obiettivo è far incontrare online la domanda e l’offerta d’arte, rendendo la vendita (e l’acquisto) di
        opere più facile, veloce, sicuro e accessibile.
        <br />
        <br />
        Artpay permette alle gallerie più autorevoli di offrire in vendita online le proprie opere a un pubblico vasto
        di appassionati d’arte che possono acquistare le opere di loro interesse in modo diretto attraverso i principali
        strumenti di pagamento messi a disposizione dalla piattaforma o attraverso strumenti finanziari che abilitano
        l’acquisto a rate, erogati da partner selezionati da Artpay.
        <br />
        <br />
        La possibilità di poter acquistare opere attraverso strumenti finanziari rateali allarga in modo significativo
        la base di utenti, portando l’arte ben oltre i consueti circuiti del collezionismo, verso un pubblico più ampio,
        giovane e diversificato.
        <br />
        <br />
        Rivoluziona il mercato dell’arte con noi!
      </>
    ),
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
    <DefaultLayout
      pb={3}
      hasNavBar={false}
      pageLoading={!ready}
      topBar={<HeroAbout {...heroContent} buttonAction={auth.isAuthenticated ? undefined : () => auth.login()} />}
      >
      <Grid sx={{ ...centeredGridSx, maxWidth: 'xl',  flexDirection: isMobile ? "column" : undefined }} container>
        <Grid xs={12} sm={4} lg={5} sx={{ pb: { xs: 3, sm: 0 }, height: "auto" }} item>
          <img style={{ width: imgWidth, maxWidth: "300px", minHeight: isMobile ? "70px" : undefined }} src={imgLogo} />
        </Grid>
        <Grid xs={12} sm={8} lg={7} item>
          <Typography variant="h2">
            La nostra missione è rendere l'arte accessibile a tutti, trasformando radicalmente il modo in cui le opere
            d'arte vengono scoperte, acquisite e apprezzate.
            <br />
            <br />
            Con Artpay, vogliamo connettere gallerie di fama mondiale, artisti emergenti e collezionisti ed
            appassionati, creando un ecosistema innovativo che celebra la diversità e l'unicità dell'arte contemporanea.
            <br />
            <br />
            Siamo impegnati a fornire un'esperienza senza pari, dove la tecnologia incontra la creatività per ispirare e
            contribuire a trasformare il mercato dell'arte.
          </Typography>
          <Typography sx={{ mt: 6 }} variant="h4">
            Con il nostro approccio innovativo che offre anche sistemi di pagamento rateale integrati nella piattaforma,
            vogliamo abbattere le barriere finanziarie e consentire a chiunque, sia che desideri godersi un'opera per il
            puro piacere estetico che per investimento, di poter realizzare i propri sogni senza compromessi.
          </Typography>
        </Grid>
      </Grid>
      {/*<Box display="flex" flexDirection="column" gap={3} sx={{ px: px }}>
        <PromoCard border title="Per le gallerie">
          <Typography variant="body1">
            Artpay è la soluzione che velocizza e semplifica il processo di vendita per i galleristi. Offriamo loro
            l'opportunità di ampliare la loro presenza online, raggiungendo un vasto pubblico di appassionati d'arte e
            collezionisti. La nostra piattaforma facilita le transazioni dirette e offre un supporto nella gestione
            delle approvazioni di finanziamento tramite i nostri partner. Collega la tua galleria al mondo dell'arte in
            modo rapido e agevole con Artpay.
          </Typography>
        </PromoCard>
        <PromoCard border title="Per i collezionisti">
          <Typography variant="body1">
            Artpay offre agli investitori e agli appassionati d'arte un accesso privilegiato al mondo dell'arte. Esplora
            una vasta selezione di opere curate dai migliori galleristi italiani e trova capolavori che soddisfino le
            tue ambizioni di investimento o semplicemente la tua passione per l'arte. Grazie alla nostra piattaforma, il
            processo di acquisto diventa rapido, semplice e sicuro, permettendo di connettersi direttamente con il
            mercato dell'arte. Acquista con fiducia e godi dell'opera immediatamente, senza barriere, con Artpay.
          </Typography>
        </PromoCard>
      </Box>*/}
      {/*<OnboardingCards sx={{ my: 8 }} />*/}
      <Grid sx={{ px: px , ...centeredGridSx, maxWidth: 'xl'}} my={12} container>
        <Grid xs={12} mb={{ xs: 4, md: 6 }} item>
          <Typography variant="display3">Artpay in persona</Typography>
        </Grid>
        <Grid xs={12} md={6} item sx={{maxWidth: 'xl'}}>
          <Typography
            sx={{ maxWidth: { xs: undefined, md: "506px" }, pr: { xs: undefined, md: 6, lg: 0 } }}
            variant="h4">
            Artpay è partner di primari istituti bancari come Santander ed è un progetto innovativo,
            cresciuto all’interno di The Net Value, primo incubatore certificato di startup innovative in Sardegna. La
            start up è stata selezionata nel 2024 per la partecipazione a “SIOS Sardinia 2024”, l’open summit dedicato
            alle start up italiane.
          </Typography>
        </Grid>
        <Grid xs={12} md={6} item>
          <Typography sx={{ mt: { xs: 3, md: 0 }, maxWidth: { xs: undefined, md: "400px" } }} variant="subtitle1">
            Artpay è fondata e diretta da Luca Pineider, appassionato di arte e design, imprenditore, da oltre 20 anni
            nel campo della comunicazione e nel digital. Titolare dell’agenzia di comunicazione Saganaki, ha seguito nel
            tempo importanti progetti legati al mondo dell’arte e del web (tra cui Artissima, Luci d’Artista, Giulio
            Paolini, Fondazione Torino Musei, Reggia di Venaria) e guida un team con al suo attivo molteplici esperienze
            e progetti in ambito marketing & comunicazione, media e sviluppo tecnologico per primari clienti nazionali e
            multinazionali.
          </Typography>
          <Typography sx={{ mt: { xs: 3, md: 6 }, maxWidth: { xs: undefined, md: "400px" } }} variant="subtitle1">
            Il team di Artpay è composto da più di 10 professionisti, che curano gli aspetti tecnologici, contenutistici
            e manageriali della piattaforma.
          </Typography>
        </Grid>
      </Grid>
      <Box sx={{ px: px, ...centeredGridSx, maxWidth: 'xl' }}>
        <NewsletterBig />
        <EmailContactBox />
      </Box>
    </DefaultLayout>
  );
};

export default About;
