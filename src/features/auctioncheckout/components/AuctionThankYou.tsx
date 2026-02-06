import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button, Paper } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useData } from "../../../hoc/DataProvider.tsx";
import type { Order } from "../../../types/order.ts";
import AuctionCheckoutLayout from "../layouts/AuctionCheckoutLayout.tsx";
import {
  calculateOrderSubtotal,
  calculateArtpayFee,
  calculatePaymentGatewayFee,
} from "../../cdspayments/utils/orderCalculations.ts";

/**
 * Thank you page after successful payment
 */
const AuctionThankYou = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const data = useData();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError("ID ordine mancante");
        setLoading(false);
        return;
      }

      try {
        const orderData = await data.getOrder(Number(orderId));

        if (!orderData) {
          setError("Ordine non trovato");
        } else {
          setOrder(orderData);
        }
      } catch (err) {
        console.error("Error loading order:", err);
        setError("Errore durante il caricamento dell'ordine");
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [orderId, data]);

  if (loading) {
    return (
      <AuctionCheckoutLayout>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography>Caricamento...</Typography>
        </Box>
      </AuctionCheckoutLayout>
    );
  }

  if (error || !order) {
    return (
      <AuctionCheckoutLayout>
        <Box sx={{ textAlign: "center", py: 8, maxWidth: 600, mx: "auto" }}>
          <Typography variant="h5" gutterBottom color="error">
            {error || "Ordine non trovato"}
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            sx={{ mt: 3 }}
          >
            Torna alla home
          </Button>
        </Box>
      </AuctionCheckoutLayout>
    );
  }

  // Calculate totals
  const subtotal = calculateOrderSubtotal(order);
  const artpayFee = calculateArtpayFee(order, subtotal);
  const gatewayFee = calculatePaymentGatewayFee(order);
  const total = subtotal + artpayFee + gatewayFee;

  // Get order details
  const orderDesc =
    order.meta_data?.find((meta) => meta.key === "original_order_desc")?.value ||
    "Acquisto asta";
  const vendorName =
    order.meta_data?.find((meta) => meta.key === "vendor_name")?.value || "Casa d'asta";

  return (
    <AuctionCheckoutLayout>
      <Box sx={{ maxWidth: 800, mx: "auto", py: 4 }}>
        <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
          {/* Success Icon */}
          <CheckCircleOutlineIcon
            sx={{
              fontSize: 80,
              color: "success.main",
              mb: 2,
            }}
          />

          {/* Success Message */}
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Pagamento completato!
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Grazie per il tuo acquisto. Riceverai una conferma via email a breve.
          </Typography>

          {/* Order Details */}
          <Box
            sx={{
              textAlign: "left",
              bgcolor: "grey.50",
              p: 3,
              borderRadius: 2,
              mb: 4,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Riepilogo Ordine
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Numero ordine</Typography>
                <Typography fontWeight={500}>#{order.id}</Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Descrizione</Typography>
                <Typography>{orderDesc}</Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Venditore</Typography>
                <Typography>{vendorName}</Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Metodo di pagamento</Typography>
                <Typography sx={{ textTransform: "capitalize" }}>
                  {order.payment_method_title || order.payment_method}
                </Typography>
              </Box>

              <Box
                sx={{
                  borderTop: 1,
                  borderColor: "divider",
                  pt: 2,
                  mt: 1,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6">Totale</Typography>
                <Typography variant="h6" fontWeight={600}>
                  € {total.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              component={RouterLink}
              to="/dashboard"
              variant="contained"
              size="large"
              fullWidth
            >
              Vai alla Dashboard
            </Button>

            <Button
              component={RouterLink}
              to="/"
              variant="outlined"
              size="large"
              fullWidth
            >
              Torna alla home
            </Button>
          </Box>

          {/* Help Text */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: "block" }}>
            Se hai domande sul tuo ordine, contatta l'assistenza.
          </Typography>
        </Paper>
      </Box>
    </AuctionCheckoutLayout>
  );
};

export default AuctionThankYou;