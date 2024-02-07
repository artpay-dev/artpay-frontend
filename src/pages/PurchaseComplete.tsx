import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useStripe } from "@stripe/react-stripe-js";
import { usePayments } from "../hoc/PaymentProvider.tsx";
import { CircularProgress, Grid, Typography } from "@mui/material";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { Cancel } from "@mui/icons-material";

export interface PurchaseCompleteProps {}

interface Message {
  title: string;
  text: string;
  cta?: string;
  status: "success" | "failure" | "processing";
}

const exampleSuccessMessage = `Bla bla bla grazie per il tuo acquisto, bla bla, lorem ipsum dolor sit amet consectetur. Euismod metus
              pellentesque porta aliquam ipsum aliquam aliquam consectetur dui. Massa diam egestas ultrices diam et eget
              et quis. Enim ipsum praesent venenatis auctor ultrices morbi posuere sit scelerisque. Sit nisl eu sit at
              consectetur odio est interdum.`;
const PurchaseComplete: React.FC<PurchaseCompleteProps> = ({}) => {
  const auth = useAuth();
  const stripe = useStripe();
  const payments = usePayments();

  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<Message>();

  useEffect(() => {
    if (payments.isReady) {
      const urlParams = new URLSearchParams(window.location.search);
      const clientSecret = urlParams.get("payment_intent_client_secret");
      const paymentIntent = urlParams.get("redirect_status");
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
            mt: { xs: 8, md: 12, lg: 8, xl: 0 },
            minHeight: "calc(100vh - 240px)",
            maxWidth: "100vw",
            overflowX: "hidden",
          }}
          alignItems="center"
          container>
          <Grid xs={12} lg={8} item>
            <Typography variant="h1" sx={{ typography: { xs: "h3", sm: "h1" } }}>
              {message.title}
            </Typography>
            <Typography sx={{ mt: { xs: 3, md: 6 } }} variant="body1">
              {message.text}
            </Typography>
            <Typography sx={{ mt: { xs: 2, md: 3 } }} variant="body1">
              {message.cta}
            </Typography>
          </Grid>
          <Grid display="flex" alignItems="center" justifyContent="center" xs={12} lg={4} item>
            {message.status === "success" && <img src="/payment-success.svg" />}
            {message.status === "failure" && (
              <Cancel fontSize="large" sx={{ height: "140px", width: "140px" }} color="error" />
            )}
            {message.status === "processing" && <CircularProgress size="140px" />}
          </Grid>
        </Grid>
      )}
    </DefaultLayout>
  );
};

export default PurchaseComplete;
