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
import { useData } from "../hoc/DataProvider.tsx";

import paymentSuccess from "../assets/images/payment-success.svg";
import { getDefaultPaddingX } from "../utils.ts";
import { useParams } from "react-router-dom";

export interface PurchaseCompleteProps {
}

interface BankTransferInstructions {
  iban: string;
  accountHolderName: string;
  reference: string;
  formattedAmount: string;
}

interface Message {
  title: string | ReactElement;
  text: string | ReactElement;
  cta?: string;
  bankTransferInstructions?: BankTransferInstructions;
  status: "success" | "failure" | "processing" | "requires_action";
}

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
  const data = useData();
  const stripe = useStripe();
  const payments = usePayments();
  const { order_id: orderId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));


  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<Message>();

  //TODO: aggiornamento ordine: payment method, stato ordine, nota per blocco opera

  useEffect(() => {
    if (payments.isReady) {
      const urlParams = new URLSearchParams(window.location.search);
      const clientSecret = urlParams.get("payment_intent_client_secret");
      const paymentIntent = urlParams.get("payment_intent");
      const redirectStatus = urlParams.get("redirect_status");

      let galleryName = "";

      if (!clientSecret || !paymentIntent || !redirectStatus) {
        setMessage({
          title: "Si è verificato un errore",
          text: "Impossibile caricare le informazioni sul pagamento",
          cta: "",
          status: "failure"
        });
        setReady(true);
        return;
      }
      if (!stripe) {
        setMessage({
          title: "Pagamento in elaborazione",
          text: "Stiamo verificando il tuo pagamento, attendi qualche minuto",
          cta: "",
          status: "processing"
        });
        setReady(true);
        return;
      }

      const completedOrderId = localStorage.getItem("completed-order");

      stripe.retrievePaymentIntent(clientSecret).then(async ({ paymentIntent }) => {
        if (orderId) {
          const order = await data.getOrder(+orderId);
          if (order?.line_items.length) {
            galleryName = order?.line_items[0].meta_data.find(({ key }) => key === "Venduto da")?.display_value || "";
          }
        }

        switch (paymentIntent?.status) {
          case "succeeded":
            if (completedOrderId) {
              try {
                await data.updateOrder(+completedOrderId, {
                  payment_method: "Credit card",
                  payment_method_title: "Carta di credito"
                });
              } catch (e) {
                console.error(e);
                // TODO: errore
              }
              localStorage.removeItem("completed-order");

            }


            setMessage({
              title: <>Ciao {auth.user?.username || ""},<br /> grazie per aver scelto Artpay!</>,
              text: <>L’acquisto è andato a buon fine. A breve sarai contattato dalla galleria {galleryName} per
                definire le modalità di acquisizione/spedizione dell’opera</>,
              cta: "",
              status: "success"
            });
            break;
          case "processing":
            setMessage({
              title: "Pagamento in elaborazione",
              text: "Stiamo verificando il tuo pagamento, attendi qualche minuto",
              cta: "",
              status: "processing"
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
                status: "failure"
              });
            } else {
              const iban = nextAction.display_bank_transfer_instructions.financial_addresses[0].iban?.iban || "";
              const reference = nextAction.display_bank_transfer_instructions?.reference || "";
              if (completedOrderId) {
                try {
                  await data.setOrderStatus(+completedOrderId, "on-hold", {
                    payment_method: "Stripe SEPA",
                    payment_method_title: "Bonifico bancario",
                    customer_note: `IBAN: ${iban} - Causale: ${reference}`
                  });
                } catch (e) {
                  console.error(e);
                  // TODO: errore
                }
                localStorage.removeItem("completed-order");
              }
              //
              setMessage({
                title: "Grazie per aver scelto Artpay!",
                text: bankTransferMessage,
                cta: "",
                status: "requires_action",
                bankTransferInstructions: {
                  accountHolderName:
                    nextAction.display_bank_transfer_instructions.financial_addresses[0].iban.account_holder_name || "",
                  formattedAmount: `€ ${(nextAction.display_bank_transfer_instructions.amount_remaining / 100).toFixed(
                    2
                  )}`,
                  iban: iban,
                  reference: reference
                }
              });
            }
            break;
          case "requires_payment_method":
            setMessage({
              title: "Si è verificato un errore",
              text: "Il tuo pagamento non è andato a buon fine, riprova",
              cta: "",
              status: "failure"
            });
            break;
          default:
            setMessage({
              title: "Si è verificato un errore",
              text: "",
              cta: "",
              status: "failure"
            });
            break;
        }
        setReady(true);
      });
    }
  }, [auth.user?.username, payments.isReady, stripe]);

  const px = getDefaultPaddingX();

  //TODO: pulsanti copia

  return (
    <DefaultLayout pageLoading={!ready} minHeight="30vh" authRequired>
      {message && (
        <Grid
          mt={2}
          sx={{
            px: px,
            mt: { xs: 8, md: 12, lg: 12, xl: message.status === "requires_action" ? 14 : 0 },
            minHeight: "calc(100vh - 240px)",
            maxWidth: "100vw",
            overflowX: "hidden"
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
                  <DisplayProperty copy label="IBAN" value={message?.bankTransferInstructions?.iban || ""} />
                  <DisplayProperty
                    sx={{ mt: 2 }}
                    copy
                    label="Intestatario"
                    value={message?.bankTransferInstructions?.accountHolderName || ""}
                  />
                  <DisplayProperty
                    sx={{ mt: 2 }}
                    copy
                    label="Causale"
                    value={message?.bankTransferInstructions?.reference || ""}
                  />
                  <DisplayProperty
                    sx={{ mt: 2 }}
                    copy
                    label="Importo"
                    value={message?.bankTransferInstructions?.formattedAmount || ""}
                  />
                </ContentCard>
              </Box>
            )}
          </Grid>
          <Grid display="flex" alignItems="center" justifyContent="center" xs={12} lg={3} xl={4} item>
            {message.status === "success" && <img src={paymentSuccess} />}
            {message.status === "failure" && (
              <Cancel fontSize="large" sx={{ height: "140px", width: "140px" }} color="error" />
            )}
            {message.status === "processing" && <CircularProgress size="140px" />}
            {message.status === "requires_action" && !isMobile && <img src={paymentSuccess} />}
          </Grid>
        </Grid>
      )}
    </DefaultLayout>
  );
};

export default PurchaseComplete;
