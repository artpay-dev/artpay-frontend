import React from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Typography, useTheme } from "@mui/material";
import Accordion from "../components/Accordion.tsx";

export interface FaqProps {
}

const Faq: React.FC<FaqProps> = ({}) => {
  const theme = useTheme();

  return (
    <DefaultLayout>
      <Box sx={{ px: { xs: 3, sm: 6 }, pt: { xs: 8, md: 12 } }} mb={6}>
        <Typography variant="h1">Faq</Typography>
        <Typography sx={{ mt: 3 }} variant="subtitle1">
          Qui troverai una serie di risposte alle domande più comuni su artpay, bla bla bla lorem ipsum dolor sit amet
          consectetur. Euismod metus pellentesque porta aliquam ipsum aliquam aliquam consectetur dui. Massa diam
          egestas ultrices diam et eget et quis. Enim ipsum praesent venenatis auctor ultrices morbi posuere sit
          scelerisque. Sit nisl eu sit at consectetur odio est interdum.
        </Typography>
      </Box>
      <Box display="flex" justifyContent="space-between" sx={{ overflow: "hidden" }}>
        <Box sx={{ px: { xs: 3, sm: 6 }, maxWidth: "800px", flexGrow: 1 }}>
          <Accordion
            title="Come entro in contatto con artpay?"
            content={
              <>
                <span style={{ color: theme.palette.primary.main }}>Pianifica una call per avere più informazioni</span>
                : attiva la chat, compila il form o scrivici una email e sarai ricontattato al più presto.
              </>
            }
          />
          <Accordion
            title="Come entro in contatto con artpay?"
            content={
              <>
                <span style={{ color: theme.palette.primary.main }}>Pianifica una call per avere più informazioni</span>
                : attiva la chat, compila il form o scrivici una email e sarai ricontattato al più presto.
              </>
            }
          />
          <Accordion
            title="Come entro in contatto con artpay?"
            content={
              <>
                <span style={{ color: theme.palette.primary.main }}>Pianifica una call per avere più informazioni</span>
                : attiva la chat, compila il form o scrivici una email e sarai ricontattato al più presto.
              </>
            }
          />
          <Accordion
            title="Come entro in contatto con artpay?"
            content={
              <>
                <span style={{ color: theme.palette.primary.main }}>Pianifica una call per avere più informazioni</span>
                : attiva la chat, compila il form o scrivici una email e sarai ricontattato al più presto.
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
          <img style={{ maxHeight: "100%" }} src="/images/illustration-world.svg" />
        </Box>
      </Box>
      <Box sx={{ px: { xs: 3, sm: 6 } }}>
        <Typography variant="h2">Non hai trovato le risposte che cercavi?</Typography>
      </Box>
      <Box display="flex" sx={{ overflow: "hidden" }} justifyContent="space-between">
        <Box sx={{ px: { xs: 3, sm: 6 }, maxWidth: "800px", flexGrow: 1 }}>
          <Typography sx={{ mt: 2, mb: 6 }} variant="subtitle1">
            Scrivici per avere tutte le informazioni che cerchi
          </Typography>
        </Box>
        <Box
          sx={{
            overflow: "visible",
            display: { xs: "none", md: "block" },
            pt: 6,
            maxWidth: { md: "calc(100vw - 700px)", xl: undefined }
          }}>
          <img style={{ maxHeight: "100%" }} src="/images/illustration-form.svg" />
        </Box>
      </Box>
    </DefaultLayout>
  );
};

export default Faq;
