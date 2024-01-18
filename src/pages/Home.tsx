import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { Button, Grid, Typography } from "@mui/material";
import { useData } from "../hoc/DataProvider.tsx";
import { Gallery } from "../types/gallery.ts";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { useNavigate } from "react-router-dom";
import HeroSlider from "../components/HeroSlider.tsx";
import PromoBig from "../components/PromoBig.tsx";
import PromoSmall from "../components/PromoSmall.tsx";
import NewsletterBig from "../components/NewsletterBig.tsx";

export interface HomeProps {}

const Home: React.FC<HomeProps> = ({}) => {
  const data = useData();
  const auth = useAuth();
  const navigate = useNavigate();

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated) {
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
    }
  }, [auth, auth.isAuthenticated, data]);

  return (
    <DefaultLayout pageLoading={!isReady} maxWidth={false}>
      <HeroSlider />
      <PromoBig
        title={"Promo big"}
        subtitle={
          "Euismod metus pellentesque porta aliquam ipsum aliquam aliquam consectetur dui. Massa diam egestas ultrices diam et eget et quis."
        }
        cta={"CTA promo big"}
        imgUrl={"/promo-big-example.jpg"}
        sx={{ mt: { xs: 3, sm: 6, md: 15 }, mb: 5 }}
      />
      <Grid sx={{ px: 6 }} spacing={2} container>
        <Grid item xs={12} md={6}>
          <PromoSmall title="Promo small" cta="CTA promo small" imgUrl="/gallery-info-image.png" />
        </Grid>
        <Grid item xs={12} md={6}>
          <PromoSmall title="Promo small" cta="CTA promo small" imgUrl="/gallery-info-image.png" contrast />
        </Grid>
      </Grid>
      <Grid container>
        <Grid mt={4} xs={12} item>
          <NewsletterBig />
        </Grid>
      </Grid>
      <Grid sx={{ maxWidth: "1440px", minHeight: "90vh", pt: 12, px: 6, flexDirection: "column" }} container>
        {auth.isAuthenticated ? (
          <Grid item xs={12} display="flex" flexDirection="column">
            <Typography variant="h3">Seleziona galleria</Typography>
            {galleries
              .filter((gallery) => !!gallery?.shop?.slug)
              .map((gallery, i) => (
                <Button key={i} onClick={() => navigate(`/gallerie/${gallery.shop.slug}`)}>
                  {gallery.display_name}
                </Button>
              ))}
          </Grid>
        ) : (
          <Typography variant="h5" color="error">
            Effettua il login
          </Typography>
        )}
      </Grid>
    </DefaultLayout>
  );
};

export default Home;
