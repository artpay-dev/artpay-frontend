import React from "react";
import santanderLogo from "../assets/images/santander_logo_1.svg";
import { Box, BoxProps, Button, Typography } from "@mui/material";
import { useAuth } from "../hoc/AuthProvider.tsx";
import { PaymentIntent } from "@stripe/stripe-js";
import { Artwork } from "../types/artwork.ts";


export interface SantanderCardProps {
  background?: string;
  sx?: BoxProps["sx"];
  paymentIntent?: PaymentIntent;
  artwork?: Partial<Artwork>
}

const SantanderCard: React.FC<SantanderCardProps> = ({ background = "#F5F5F5", sx = {}, paymentIntent, artwork }) => {
  const { user } = useAuth();

  const event_name = 'santander_click';
  const properties = {
        id: user?.id || "anonimo",
        username: user?.username || "non fornito",
        event_data: {}
    };

  if (paymentIntent || artwork) {
    properties.event_data = {
      artwork: {
        artwork_id: artwork?.id || 'view payment order',
        artwork_title: artwork?.name || 'view payment order',
        artwork_price: artwork?.price || paymentIntent?.amount || 'no payment intent',
      },
      user_email: user?.email || 'anonimo',
      amount: paymentIntent?.amount || 'no payment intent',
      order_description: paymentIntent?.description || 'no payment intent'
    }
  }

  const handleButtonClick = () => {

    window.Brevo.push([
      "track",
      event_name,
      properties,
    ]);

  };

  return (
    <Box
      sx={{
        background: background,
        borderRadius: "24px",
        width: { xs: "auto", md: "400px" },
        p: 3,
        mt: { xs: 10, md: 0 },
        ...sx,
      }}>
      <img style={{ height: "24px" }} src={santanderLogo} />
      <Box sx={{ background: "white", py: 2, textAlign: "center" }} mt={3} mb={2}>
        <Typography fontWeight={500} variant="body1">
          prestiti fino a
        </Typography>
        <Typography fontWeight={500} variant="h3" color="primary">
          30.000€
        </Typography>
      </Box>
      <Button
        fullWidth
        onClick={handleButtonClick}
        sx={{ textAlign: "center" }}
        href="https://www.santanderconsumer.it/prestito/partner/artpay"
        target="_blank"
        variant="contained">
        Calcola la rata
      </Button>
      <Typography sx={{ textAlign: "center", width: "100%", mt: 1 }} fontWeight={500} variant="caption">
        Gratis e senza impegno
      </Typography>
      <Typography sx={{ textAlign: "center", width: "100%", fontSize: "10px", mt: 3 }} variant="caption">
        Annuncio pubblicitario con finalità promozionale. Per tutte le condizioni contrattuali ed economiche consultare
        le «Informazioni europee di base sul credito ai consumatori» disponibile presso gli Agenti della Banca e sulla
        sezione Trasparenza del sito www.santanderconsumer.it Salvo approvazione Santander Consumer Bank.
      </Typography>
    </Box>
  );
};

export default SantanderCard;
