import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Link, Typography } from "@mui/material";
import Accordion from "../components/Accordion.tsx";
import illustrationWorld from "../assets/images/illustration-world.svg";
import EmailContactBox from "../components/EmailContactBox.tsx";
import { getEntriesByType } from "../services/contentful.ts";
import { useAuth } from "../hoc/AuthProvider.tsx";

export interface FaqProps {}

type AccordionFaq = {
  question: string;
  answer: string;
};

const Faq: React.FC<FaqProps> = ({}) => {
  const [faqs, setFaqs] = useState<AccordionFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await getEntriesByType("faqAccordion");
        const transformedFaqs: AccordionFaq[] = response.map((item: any) => ({
          question: item.question || '',
          answer: item.answer || ''
        }));
        setFaqs(transformedFaqs.reverse());
      } catch (err) {
        console.error("Error fetching faqs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);


  return (
    <DefaultLayout hasNavBar={auth.isAuthenticated}>
      <Box mb={6} className={"px-4 md:px-8 pt-35 md:pt-0"}>
        <Typography variant="h1">Faq</Typography>
        <Typography sx={{ mt: 3 }} variant="subtitle1">
          Qui troverai una serie di risposte alle domande più comuni per i collezionisti e appassionati d’arte
          interessati al servizio offerto da Artpay. Se sei un gallerista, puoi consultare le FAQ nella{" "}
          <Link href="https://gallerie.artpay.art/faq/">pagina di Artpay dedicata alle gallerie</Link>
        </Typography>
      </Box>
      {!loading && faqs.length > 0 ? (
        <Box display="flex" justifyContent="space-between" sx={{ overflow: "hidden" }}>
          <Box className={"px-4 md:px-8"} sx={{ maxWidth: "800px", flexGrow: 1 }}>
            {faqs.map((faq, index) => (
              <Accordion
                key={index}
                title={faq.question}
                content={<>{faq.answer}</>}
              />
            ))}
          </Box>
          <Box
            sx={{
              overflow: "visible",
              display: { xs: "none", md: "block" },
              maxWidth: { md: "calc(100vw - 700px)", xl: undefined },
              pt: 3,
            }}>
            <img style={{ maxHeight: "100%" }} src={illustrationWorld} alt="Illustration World" />
          </Box>
        </Box>
      ) : (
        <></>
      )}
      <EmailContactBox title="Non hai trovato le risposte che cercavi?" />
    </DefaultLayout>
  );
};

export default Faq;
