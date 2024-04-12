import React from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Link, Typography } from "@mui/material";
import Accordion from "../components/Accordion.tsx";

import illustrationWorld from "../assets/images/illustration-world.svg";
import illustrationForm from "../assets/images/illustration-form.svg";
import { getDefaultPaddingX } from "../utils.ts";

export interface FaqProps {
}

const Faq: React.FC<FaqProps> = ({}) => {


  const px = getDefaultPaddingX();

  return (
    <DefaultLayout>
      <Box sx={{ px: px, pt: { xs: 12, md: 16, lg: 18 } }} mb={6}>
        <Typography variant="h1">Faq</Typography>
        <Typography sx={{ mt: 3 }} variant="subtitle1">
          Qui troverai una serie di risposte alle domande più comuni per i collezionisti e appassionati d’arte
          interessati al servizio offerto da Artpay.
          Se sei un gallerista, puoi consultare le FAQ nella <Link href="https://gallerie.artpay.art/faq/">
          pagina di Artpay dedicata alle gallerie</Link>
        </Typography>
      </Box>
      <Box display="flex" justifyContent="space-between" sx={{ overflow: "hidden" }}>
        <Box sx={{ px: px, maxWidth: "800px", flexGrow: 1 }}>
          <Accordion
            title="Ci sono costi di abbonamento al servizio?"
            content={
              <>
                No, Artpay è gratuito per i collezionisti.
              </>
            }
          />
          <Accordion
            title="Ci sono limiti al numero di opere che posso visualizzare o acquistare?"
            content={
              <>
                No, puoi visualizzare tutte le opere disponibili sulla piattaforma e acquistarne quante desideri.
              </>
            }
          />
          <Accordion
            title="Posso negoziare privatamente il prezzo delle opere?"
            content={
              <>
                Sì, puoi contattare direttamente il gallerista per trattare il prezzo dell'opera.
              </>
            }
          />
          <Accordion
            title="Artpay si occupa di spedizione e installazione delle opere?"
            content={
              <>
                No, la spedizione e l'installazione delle opere sono gestite direttamente dal gallerista.
              </>
            }
          />
        </Box>
        <Box
          sx={{
            overflow: "visible",
            display: { xs: "none", md: "block" },
            maxWidth: { md: "calc(100vw - 700px)", xl: undefined },
            pt: 3
          }}>
          <img style={{ maxHeight: "100%" }} src={illustrationWorld} />
        </Box>
      </Box>
      <Box sx={{ px: px }}>
        <Typography variant="h2">Non hai trovato le risposte che cercavi?</Typography>
      </Box>
      <Box display="flex" sx={{ overflow: "hidden", px: px }} justifyContent="space-between">
        <Box sx={{ maxWidth: "800px", flexGrow: 1 }}>
          <Typography sx={{ mt: 2, mb: 6 }} variant="subtitle1">
            <Link href="mailto:hello@artpay.art">Scrivici</Link> per avere tutte le informazioni che cerchi
          </Typography>
        </Box>
        <Box
          sx={{
            overflow: "visible",
            display: { xs: "none", md: "block" },
            pt: 6,
            maxWidth: { md: "calc(100vw - 700px)", xl: undefined }
          }}>
          <img style={{ maxHeight: "100%" }} src={illustrationForm} />
        </Box>
      </Box>
    </DefaultLayout>
  );
};

export default Faq;
