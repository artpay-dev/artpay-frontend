import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import { useData } from "../hoc/DataProvider.tsx";
import NewsletterBig from "../components/NewsletterBig.tsx";
import { getDefaultPaddingX } from "../utils.ts";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import HeroHome from "../components/HeroHome.tsx";
import InfoCard from "../components/InfoCard.tsx";
import imgRocket from "../assets/images/rocket.svg";
import imgEye from "../assets/images/eye.svg";
import imgArtwork from "../assets/images/abstact-artwork.svg";
import OnboardingCards from "../components/OnboardingCards.tsx";

export interface HomeProps {
}

const Home: React.FC<HomeProps> = ({}) => {
  const data = useData();
  // const navigate = useNavigate();
  const snackbar = useSnackbars();
  const theme = useTheme();

  // const [featuredArtworks, setFeaturedArtworks] = useState<ArtworkCardProps[]>();
  // const [featuredArtists, setFeaturedArtists] = useState<ArtistCardProps[]>();
  // const [homeContent, setHomeContent] = useState<HomeContent>();
  const [isReady, setIsReady] = useState(false);

  /*const handleSelectArtwork = (item?: ArtworkCardProps) => {
    if (item) {
      navigate(`/opere/${item.slug}`);
    }
  };*/

  useEffect(() => {
    setIsReady(true);
    /*Promise.all([
      // data.getHomeContent().then((resp) => setHomeContent(resp)),
      data.listFeaturedArtworks().then((resp) => setFeaturedArtworks(artworksToGalleryItems(resp))),
      data.listFeaturedArtists().then((resp) => setFeaturedArtists(artistsToGalleryItems(resp)))
    ])
      .then(() => {
        setIsReady(true);
      })
      .catch(async (err) => {
        await snackbar.error(err, { autoHideDuration: 60000 });
      });*/
    /*if (auth.isAuthenticated) {
      data
        .listGalleries()
        .then((resp) => setGalleries(resp))
        .catch((err) => {
          console.log("Error", err);
        })
        .finally(() => setIsReady(true));
    } else {
      setIsReady(true);
      auth.login();
    }*/
    // auth, auth.isAuthenticated,
  }, [data, snackbar]);

  const px = getDefaultPaddingX();

  return (
    <DefaultLayout pageLoading={!isReady} topBar={<HeroHome />} maxWidth="xl">

      <Box sx={{ px: px, my: { xs: 6, md: 12 }, maxWidth: theme.breakpoints.values["xl"], ml: "auto", mr: "auto" }}>
        <Typography variant="display3" sx={{}}>
          Scopri l’eccellenza dei migliori galleristi Italiani e le loro collezioni selezionate, da oggi a portata di
          mano.
        </Typography>
      </Box>
      <Box
        sx={{
          px: px,
          maxWidth: theme.breakpoints.values["xl"], ml: "auto", mr: "auto",
          gridTemplateColumns: { xs: undefined, sm: "1fr 1fr 1fr" },
          display: { xs: "flex", sm: "grid" },
          flexDirection: { xs: "column", sm: undefined },
          gap: 3
        }}>
        <Box>
          <InfoCard
            title="Esplora l'arte dei top galleristi italiani su Artpay!"
            subtitle="Artpay collabora con i più autorevoli galleristi italiani per offrire una selezione eccezionale di opere d'arte, garantendo la qualità e l'autenticità di ogni pezzo presente sulla nostra piattaforma."
            imgSrc={imgEye}
          />
        </Box>
        <Box>
          <InfoCard
            title="Tecnologia innovativa per l’arte a portata di click!"
            subtitle="Artpay utilizza tecnologie all'avanguardia per semplificare il processo di acquisto e vendita d'arte, offrendo transazioni rapide, sicure e convenienti attraverso la nostra intuitiva piattaforma online."
            imgSrc={imgRocket}
          />
        </Box>
        <Box>
          <InfoCard
            title="Collezioni selezionate"
            subtitle="Artpay collabora con i più autorevoli galleristi italiani per offrire una selezione eccezionale di opere d'arte, che ne garantiscono la qualità e l'autenticità di ogni pezzo presente sulla nostra piattaforma."
            imgSrc={imgArtwork}
          />
        </Box>
      </Box>
      <OnboardingCards />
      <Grid sx={{ px: px, ml: "auto", mr: "auto", mb: 12 }} maxWidth="xl" container>
        <Grid mt={4} xs={12} item>
          <NewsletterBig
            title="Iscriviti ora per ricevere aggiornamenti esclusivi su Artpay direttamente nella tua casella di posta" />
        </Grid>
      </Grid>
      {/*<Grid sx={{ px: px, my: 12, ml: "auto", mr: "auto" }} maxWidth="xl" container>
        <ArtistsList disablePadding size="medium" items={featuredArtists || []} title="Artisti in evidenza" />
      </Grid>
      <Grid sx={{ px: px, my: 12, justifyContent: "flexStart", ml: "auto", mr: "auto" }} maxWidth="xl" container>
        {featuredArtworks && (
          <ArtworksList
            disablePadding
            items={featuredArtworks || []}
            onSelect={(i) => handleSelectArtwork(featuredArtworks[i])}
            title="Opere in evidenza"
            showEmpty
          />
        )}
      </Grid>*/}
      {/*      <Grid spacing={4} sx={{ mt: 4 }} justifyContent="center" container>
        {homeContent?.promoItems.map((promoItem, i) => <PromoItem key={`promo-${i}`} {...promoItem} />)}
      </Grid>*/}


    </DefaultLayout>
  );
};

export default Home;
