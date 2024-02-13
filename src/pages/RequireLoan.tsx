import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Button, Grid, Typography } from "@mui/material";
import InfoCard from "../components/InfoCard.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { useNavigate, useParams } from "react-router-dom";
import OrderCard from "../components/OrderCard.tsx";
import { Artwork } from "../types/artwork.ts";
import { artworkToOrderLoanItem } from "../utils.ts";
import OrderLoanCard, { OrderLoanCardProps } from "../components/OrderLoanCard.tsx";

export interface RequireLoanProps {}

const RequireLoan: React.FC<RequireLoanProps> = ({}) => {
  const data = useData();
  const urlParams = useParams();
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  const [artwork, setArtwork] = useState<OrderLoanCardProps>();

  useEffect(() => {
    if (!urlParams.slug_opera) {
      navigate("/");
      return;
    }
    console.log("navigate back?", urlParams.slug_opera, !urlParams.slug_opera);
    data.getArtworkBySlug(urlParams.slug_opera).then((resp) => {
      setArtwork(artworkToOrderLoanItem(resp));
      setReady(true);
    });
  }, [data, navigate, urlParams.slug_opera]);

  return (
    <DefaultLayout pageLoading={!ready}>
      <Grid mt={16} mb={6} spacing={3} sx={{ px: { xs: 3, md: 6 } }} container>
        <Grid xs={12} sx={{ mb: { xs: 6, md: 12, lg: 18 } }} item>
          <Typography sx={{ mb: { xs: 3, md: 6 } }} variant="h2">
            Richiedi finanziamento
          </Typography>
          <Typography variant="subtitle1">
            Bla bla bla come funziona l’acquisto a rate, bla bla, lorem ipsum dolor sit amet consectetur. Euismod metus
            pellentesque porta aliquam ipsum aliquam aliquam consectetur dui. Massa diam egestas ultrices diam et eget
            et quis. Enim ipsum praesent venenatis auctor ultrices morbi posuere sit scelerisque. Sit nisl eu sit at
            consectetur odio est interdum.
          </Typography>
        </Grid>
        <Grid xs={12} mb={6} item>
          <Typography sx={{ mb: { xs: 2 } }} variant="h3">
            Non vuoi farti sfuggire l’opera? Bloccala!
          </Typography>
          <Typography variant="subtitle1">
            Se sei intenzionato a richiedere un finanziamento, ti consigliamo di bloccare l'opera per non fartela
            scappare!
          </Typography>
        </Grid>
        <Grid xs={12} md={4} item>
          <InfoCard
            title="Versa un acconto"
            subtitle="Questa operazione blocca l'opera e garantisce l'esclusiva sull'acquisto. Alla ricezione dell'acconto Artpay bloccherà l'opera per 7 giorni."
            imgSrc="/boat.svg"
          />
        </Grid>
        <Grid xs={12} md={4} item>
          <InfoCard
            title="Richiedi il finanziamento"
            subtitle="Normalmente viene erogato in poche ore*."
            imgSrc="/boat.svg"
          />
        </Grid>
        <Grid xs={12} md={4} item>
          <InfoCard
            title="Compra l’opera d’arte"
            subtitle="Completato l'iter di richiesta e ricevuto il finanziamento, l'acquirente può procedere all'acquisto dell'opera dal sito Artpay"
            imgSrc="/boat.svg"
          />
        </Grid>
        <Grid xs={12} my={6} p={`0!important`} display="flex" flexDirection="column" alignItems="center" item>
          <Button variant="contained">Blocca l'opera</Button>
          <Typography sx={{ mt: 1 }} variant="body2">
            *L'erogazione del finanziamento dipende dalle garanzie fornite dal richiedente e dai tempi di risposta della
            finanziaria
          </Typography>
        </Grid>
        <Grid xs={12} sx={{ mt: { xs: 4, md: 12 } }} item />
        <Grid xs={12} md={6} item>
          <Typography variant="h3">Scegli la finanziaria</Typography>
        </Grid>
        <Grid xs={12} md={6} item>
          {artwork && <OrderLoanCard {...artwork} />}
        </Grid>
      </Grid>
    </DefaultLayout>
  );
};

export default RequireLoan;
