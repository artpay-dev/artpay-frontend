import React from "react";
import { Button, Typography } from "@mui/material";
import { useNavigate } from "../utils.ts";
import Hero from "./Hero.tsx";

export interface HeroHomeProps {}

const HeroHome: React.FC<HeroHomeProps> = ({}) => {
  const navigate = useNavigate();

  return (
    <Hero sx={{ pt: { xs: 0, md: 3, lg: 6 } }} variant="contrast">
      <Typography variant="display1" color="inherit" sx={{ mt: 1, mb: 6 }}>
        Semplice, sicura e su misura per te: scopri artpay, la prima piattaforma dedicata all'acquisto rateale di opere
        d'arte e oggetti da collezionismo.
      </Typography>
      {/*<Typography variant="subtitle1" sx={{ my: 6, maxWidth: "400px" }}>
      Artpay è un servizio digitale che facilita l’acquisto delle migliori opere d’arte attraverso una piattaforma
      digitale innovativa che offre soluzioni di acquisto rateali e personalizzabili.
    </Typography>*/}
      <Button variant="contained" color="contrast" onClick={() => navigate("/chi-siamo")}>
        Scopri di più
      </Button>
    </Hero>
  );
};

export default HeroHome;
