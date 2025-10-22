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
        artpay è la prima start-up fintech dedicata alla compravendita di
        arte contemporanea e oggetti da collezionismo, fondata in Italia
        nel 2023 e premiata agli HTSI Luxury Start Up Award 2025 del Sole
        24 Ore nella categoria Startup globale.
        <br />
        <br />
        artpay soddisfa i bisogni del mercato contemporaneo del
        collezionismo: offre un marketplace dove i collezionisti navigano
        tra le opere delle Gallerie scegliendo le modalità di pagamento più
        comode per loro e dove le Gallerie e le Case d'Asta allargano la
        loro platea avvicinando i nuovi collezionisti di oggi e di domani.
        <br />
        <br />
        artpay è l'ambiente digitale che integra tutti i protagonisti della
        compravendita d'arte e oggetti da collezionismo in un'unica
        piattaforma, facile da usare, coinvolgente e sicura al 100%.

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
            La nostra missione è rendere l'arte accessibile a tutti, trasformando radicalmente il modo in cui le opere d'arte vengono scoperte, acquistate e apprezzate.
            <br />
            <br />
            Con artpay connettiamo Gallerie affermate
            ed emergenti, artisti, collezionisti e
            appassionati, creando un ecosistema
            innovativo che celebra l'inclusività e
            l'unicità dell'arte contemporanea.
            <br />
            <br />
            Forniamo un'esperienza d'acquisto facile
            e coinvolgente, dove la tecnologia
            incontra la creatività per ispirare e
            contribuire a trasformare il mercato
            dell'arte.
            <br />
            <br />
            artpay è innovazione, inclusività,
            ontemporaneità: avviciniamo i collezionisti
            di domani alle Gallerie, rendendo più semplice
            l'acquisto di opere d'arte e oggetti da collezione.
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
          <Typography variant="display3">Noi siamo artpay</Typography>
        </Grid>
        <Grid xs={12} md={6} item sx={{maxWidth: 'xl'}}>
          <Typography
            sx={{ maxWidth: { xs: undefined, md: "506px" }, pr: { xs: undefined, md: 6, lg: 0 } }}
            variant="h4">
            Nata nel 2023 e supportata dall'incubatore
            certificato The Net Value di Cagliari, premiata
            come Best Luxury Startup Global da HTSI / Il Sole
            24 Ore nel 2024, inserita tra le 100 startup più
            innovative da Startupltalia: artpay è partner di
            primari istituti bancari e finanziari e collabora
            con Gallerie e Case d'Asta di rilevanza nazionale.
          </Typography>
        </Grid>
        <Grid xs={12} md={6} item>
          <Typography sx={{ mt: { xs: 3, md: 0 }, maxWidth: { xs: undefined, md: "400px" } }} variant="subtitle1">
            artpay è fondata e diretta da Luca Pineider,
            appassionato di arte e design, imprenditore, da oltre
            20 anni nel campo della comunicazione e nel digital.
          </Typography>
          <Typography sx={{ mt: { xs: 3, md: 6 }, maxWidth: { xs: undefined, md: "400px" } }} variant="subtitle1">
            Luca ha seguito nel tempo importanti progetti legati
            al mondo dell'arte e del web (tra cui Artissima, Luci
            d'Artista, Giulio Paolini, Fondazione Torino Musei,
            Reggia di Venaria) e ha al suo attivo molteplici
            esperienze e progetti in ambito marketing e
            comunicazione, media e sviluppo tecnologico.
          </Typography>
          <Typography sx={{ mt: { xs: 3, md: 6 }, maxWidth: { xs: undefined, md: "400px" } }} variant="subtitle1">
            Il team di artpay è composto da più di 10
            professionisti, che curano gli aspetti tecnologici,
            contenutistici e manageriali della piattaforma.
          </Typography>
        </Grid>
      </Grid>
      <Box sx={{ px: px, ...centeredGridSx, maxWidth: 'xl' }}>
        <NewsletterBig />
        <EmailContactBox title={'Entra in contatto con artpay!'}/>
      </Box>
    </DefaultLayout>
  );
};

export default About;
