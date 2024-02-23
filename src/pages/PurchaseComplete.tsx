import React, { ReactElement, useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useStripe } from "@stripe/react-stripe-js";
import { usePayments } from "../hoc/PaymentProvider.tsx";
import { Box, CircularProgress, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { Cancel } from "@mui/icons-material";
import { PiBankThin } from "react-icons/pi";
import ContentCard from "../components/ContentCard.tsx";
import DisplayProperty from "../components/DisplayProperty.tsx";
import { BankTransferAction } from "../types/order.ts";

export interface PurchaseCompleteProps {}

interface BankTransferInstructions {
  iban: string;
  accountHolderName: string;
  reference: string;
  formattedAmount: string;
}
interface Message {
  title: string;
  text: string | ReactElement;
  cta?: string;
  bankTransferInstructions?: BankTransferInstructions;
  status: "success" | "failure" | "processing" | "requires_action";
}

const exampleSuccessMessage = `Bla bla bla grazie per il tuo acquisto, bla bla, lorem ipsum dolor sit amet consectetur. Euismod metus
              pellentesque porta aliquam ipsum aliquam aliquam consectetur dui. Massa diam egestas ultrices diam et eget
              et quis. Enim ipsum praesent venenatis auctor ultrices morbi posuere sit scelerisque. Sit nisl eu sit at
              consectetur odio est interdum.`;
const bankTransferMessage = (
  <span>
    Riportiamo qui sotto gli estremi per effettuare il bonifico, copiali per essere sicuro di non perdere questa
    informazione. Ti consigliamo di procedere con il pagamento il prima possibile! Comprando infatti con bonifico
    l'opera è riservata a te per 7 giorni, scaduti i quali l'opera ritorna sul mercato e potrebbe essere acquistata da
    altri utenti. <br /> Non appena Artpay riceverà la notifica di avvenuto pagamento, la galleria ti contatterà per
    organizzare la spedizione o il pickup dell'opera in galleria.
  </span>
);
const PurchaseComplete: React.FC<PurchaseCompleteProps> = ({}) => {
  const auth = useAuth();
  const stripe = useStripe();
  const payments = usePayments();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<Message>();

  useEffect(() => {
    if (payments.isReady) {
      const urlParams = new URLSearchParams(window.location.search);
      const clientSecret = urlParams.get("payment_intent_client_secret");
      const paymentIntent = urlParams.get("payment_intent");
      const redirectStatus = urlParams.get("redirect_status");

      if (!clientSecret || !paymentIntent || !redirectStatus) {
        setMessage({
          title: "Si è verificato un errore",
          text: "Impossibile caricare le informazioni sul pagamento",
          cta: "",
          status: "failure",
        });
        setReady(true);
        return;
      }
      if (!stripe) {
        setMessage({
          title: "Pagamento in elaborazione",
          text: "Stiamo verificando il tuo pagamento, attendi qualche minuto",
          cta: "",
          status: "processing",
        });
        setReady(true);
        return;
      }

      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        switch (paymentIntent?.status) {
          case "succeeded":
            setMessage({
              title: `Ciao ${auth.user?.username || ""}, grazie per il tuo acquisto`,
              text: exampleSuccessMessage,
              cta: "",
              status: "success",
            });
            break;
          case "processing":
            setMessage({
              title: "Pagamento in elaborazione",
              text: "Stiamo verificando il tuo pagamento, attendi qualche minuto",
              cta: "",
              status: "processing",
            });
            break;
          case "requires_action":
            // eslint-disable-next-line no-case-declarations
            const nextAction = paymentIntent.next_action as BankTransferAction;
            if (!nextAction?.display_bank_transfer_instructions?.financial_addresses?.length) {
              setMessage({
                title: "Si è verificato un errore",
                text: "Dati per effettuare il bonifico non trovati",
                cta: "",
                status: "failure",
              });
            } else {
              setMessage({
                title: "Grazie per il tuo acquisto!",
                text: bankTransferMessage,
                cta: "",
                status: "requires_action",
                bankTransferInstructions: {
                  accountHolderName:
                    nextAction.display_bank_transfer_instructions.financial_addresses[0].iban.account_holder_name || "",
                  formattedAmount: `€ ${(nextAction.display_bank_transfer_instructions.amount_remaining / 100).toFixed(
                    2,
                  )}`,
                  iban: nextAction.display_bank_transfer_instructions.financial_addresses[0].iban?.iban || "",
                  reference: nextAction.display_bank_transfer_instructions?.reference || "",
                },
              });
            }
            break;
          case "requires_payment_method":
            setMessage({
              title: "Si è verificato un errore",
              text: "Il tuo pagamento non è andato a buon fine, riprova",
              cta: "",
              status: "failure",
            });
            break;
          default:
            setMessage({
              title: "Si è verificato un errore",
              text: "",
              cta: "",
              status: "failure",
            });
            break;
        }
        setReady(true);
      });
    }
  }, [payments.isReady, stripe]);

  return (
    <DefaultLayout pageLoading={!ready} minHeight="30vh" authRequired>
      {message && (
        <Grid
          mt={2}
          sx={{
            px: { xs: 2, md: 6 },
            mt: { xs: 8, md: 12, lg: 12, xl: message.status === "requires_action" ? 10 : 0 },
            minHeight: "calc(100vh - 240px)",
            maxWidth: "100vw",
            overflowX: "hidden",
          }}
          alignItems="center"
          container>
          <Grid xs={12} lg={9} xl={8} item>
            <Typography variant="h1" sx={{ typography: { xs: "h3", sm: "h1" } }}>
              {message.title}
            </Typography>
            <Typography sx={{ mt: { xs: 3, md: 3 } }} variant="body1">
              {message.text}
            </Typography>
            {message.cta && (
              <Typography sx={{ mt: { xs: 2, md: 3 } }} variant="body1">
                {message.cta}
              </Typography>
            )}
            {message.status === "requires_action" && (
              <Box mt={3} mb={6} sx={{ maxWidth: "500px" }}>
                <ContentCard
                  title="Dati bonifico"
                  icon={<PiBankThin size="28px" />}
                  contentPadding={3}
                  contentPaddingMobile={3}>
                  <DisplayProperty label="IBAN" value={message?.bankTransferInstructions?.iban || ""} />
                  <DisplayProperty
                    sx={{ mt: 2 }}
                    label="Intestatario"
                    value={message?.bankTransferInstructions?.accountHolderName || ""}
                  />
                  <DisplayProperty
                    sx={{ mt: 2 }}
                    label="Causale"
                    value={message?.bankTransferInstructions?.reference || ""}
                  />
                  <DisplayProperty
                    sx={{ mt: 2 }}
                    label="Importo"
                    value={message?.bankTransferInstructions?.formattedAmount || ""}
                  />
                </ContentCard>
              </Box>
            )}
          </Grid>
          <Grid display="flex" alignItems="center" justifyContent="center" xs={12} lg={3} xl={4} item>
            {message.status === "success" && <img src="/payment-success.svg" />}
            {message.status === "failure" && (
              <Cancel fontSize="large" sx={{ height: "140px", width: "140px" }} color="error" />
            )}
            {message.status === "processing" && <CircularProgress size="140px" />}
            {message.status === "requires_action" && !isMobile && <img src="/payment-success.svg" />}
          </Grid>
        </Grid>
      )}
    </DefaultLayout>
  );
};

export default PurchaseComplete;
