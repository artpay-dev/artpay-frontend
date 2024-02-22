import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import HeroAbout, { HeroAboutProps } from "../components/HeroAbout.tsx";
import PromoSide from "../components/PromoSide.tsx";
import { Box, Button, Grid, GridProps, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useData } from "../hoc/DataProvider.tsx";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import { artworksToGalleryItems } from "../utils.ts";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import ArtworksList from "../components/ArtworksList.tsx";

export interface AboutProps {}

const heroContent: HeroAboutProps = {
  subtitle:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  mainTitle: "Siamo artpay, l’arte è per tutti",
  description:
    "artpay è un servizio digitale dedicato a coloro che vogliono investire nell opere d’arte ma bla bla bla e che offre in pochi click soluzioni bla bla bla, di acquisto rateali e personalizzabili",
  buttonText: "Entra nel mondo di artpay",
  imageSrc: "/hero-about-cover.png",
};

const promoContent = [
  {
    title: "Iscriviti alla piattaforma",
    subtitle: "Lorem ipsum dolor sit amet consectetur. Vitae vel sit sit dictum velit at erat.",
    description: "Lorem ipsum dolor sit amet consectetur. Vitae vel sit sit dictum velit at erat.",
    imageSrc: "/hero-side-example.png",
  },
  {
    title: "Iscriviti alla piattaforma",
    subtitle: "Lorem ipsum dolor sit amet consectetur. Vitae vel sit sit dictum velit at erat.",
    description: "Lorem ipsum dolor sit amet consectetur. Vitae vel sit sit dictum velit at erat.",
    imageSrc: "/hero-side-example.png",
  },
  {
    title: "Iscriviti alla piattaforma",
    subtitle: "Lorem ipsum dolor sit amet consectetur. Vitae vel sit sit dictum velit at erat.",
    description: "Lorem ipsum dolor sit amet consectetur. Vitae vel sit sit dictum velit at erat.",
    imageSrc: "/hero-side-example.png",
  },
];
const About: React.FC<AboutProps> = ({}) => {
  const theme = useTheme();
  const data = useData();
  const snackbar = useSnackbars();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [ready, setReady] = useState(false);
  const [featuredArtworks, setFeaturedArtworks] = useState<ArtworkCardProps[]>();

  useEffect(() => {
    Promise.all([
      data.listFeaturedArtworks().then((resp) => {
        setFeaturedArtworks(artworksToGalleryItems(resp));
      }),
    ])
      .then(() => {
        setReady(true);
      })
      .catch((err) => {
        return snackbar.error(err);
      });
  }, [data, snackbar]);

  const imgWidth = isMobile ? "100%" : `calc(100% - ${theme.spacing(6)})`;

  const centeredGridSx: GridProps["sx"] = {
    marginLeft: "auto",
    marginRight: "auto",
    px: { xs: 3, md: 6 },
    py: { xs: 6, md: 12 },
    position: "relative",
    //flexDirection: isMobile ? "column-reverse" : undefined,
  };

  return (
    <DefaultLayout pb={3} pageLoading={!ready} maxWidth={false}>
      <HeroAbout {...heroContent} />
      {promoContent.map((content, i) => (
        <PromoSide {...content} reverse={i % 2 === 1} key={`promo-side-${i}`} />
      ))}
      <Grid sx={{ ...centeredGridSx, flexDirection: isMobile ? "column" : undefined }} maxWidth="xl" container>
        <Grid xs={12} sm={4} sx={{ pb: { xs: 3, sm: 0 }, height: "auto" }} item>
          <img
            style={{ width: imgWidth, maxWidth: "300px", minHeight: isMobile ? "70px" : undefined }}
            src="/logo.svg"
          />
        </Grid>
        <Grid xs={12} sm={8} item>
          <Typography sx={{ typography: { xs: "h4" }, maxWidth: "860px" }} variant="h3">
            Una fintech innovativa dedicata alle gallerie d’arte che ha l’obiettivo di semplificare e accelerare la
            vendita di opere. Artpay vuole rispondere alle nuove sfide ed esigenze di digitalizzazione del mercato
            offrendo una soluzione concreta alle nuove modalità di acquisto di collezionisti affermati ed emergenti.
          </Typography>
        </Grid>
      </Grid>
      <Grid sx={{ ...centeredGridSx, flexDirection: isMobile ? "column-reverse" : undefined }} maxWidth="xl" container>
        <Grid xs={12} sm={8} item>
          <Typography variant="h1" sx={{ fontSize: { xs: "3.5rem", sm: "5rem", md: "7rem", lg: "8rem", xl: "9rem" } }}>
            Tante opere d'arte, facilità di acquisto
          </Typography>
        </Grid>
        <Grid xs={12} sm={4} item>
          <img
            src="/about-drawing-rocket.svg"
            style={{
              position: isMobile ? "static" : "absolute",
              right: 0,
              height: isMobile ? undefined : "100%",
              width: isMobile ? "100%" : undefined,
            }}
          />
        </Grid>
      </Grid>
      <Grid sx={{ px: { xs: 0 }, mt: 4, justifyContent: "center" }} container>
        {featuredArtworks && <ArtworksList items={featuredArtworks || []} showEmpty />}
      </Grid>
      <Box sx={{ width: "100%", background: theme.palette.primary.light }} mt={6}>
        <Grid
          sx={{
            ...centeredGridSx,
            pr: "0!important",
            pt: "0!important",
            pl: { xs: "0!important", sm: "undefined" },
            pb: { xs: "0!important", sm: "undefined" },
          }}
          container>
          <Grid
            xs={12}
            sm={8}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: { xs: 3, sm: 6 },
              pb: { xs: 3, sm: 0 },
            }}
            item>
            <Typography sx={{ maxWidth: "672px", typography: { xs: "h2", sm: "h1" } }} variant="h1">
              Sei una gelleria e vuoi entrare nel circuito artpay?
            </Typography>
            <Typography sx={{ mt: 3 }} variant="h3">
              Scopri come fare
            </Typography>
            <Box>
              <Button sx={{ mt: 3 }} variant="contained">
                Artpay per le gallerie
              </Button>
            </Box>
          </Grid>
          <Grid
            xs={12}
            sm={4}
            sx={{
              textAlign: "right",
              overflow: "hidden",
              display: { xs: "flex" },
              justifyContent: { xs: undefined, sm: "end" },
            }}
            item>
            <img style={{ width: isMobile ? "100%" : undefined }} src="/image-gallery-about.png" />
          </Grid>
        </Grid>
      </Box>
    </DefaultLayout>
  );
};

export default About;
