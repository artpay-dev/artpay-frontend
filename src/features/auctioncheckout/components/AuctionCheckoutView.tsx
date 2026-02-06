import { useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuctionCheckout } from "../contexts/AuctionCheckoutContext.tsx";
import GuestBillingForm from "./GuestBillingForm.tsx";
import AuctionOrderSummary from "./AuctionOrderSummary.tsx";
import AuctionPaymentsSelection from "./AuctionPaymentsSelection.tsx";
import AuctionPaymentCard from "./AuctionPaymentCard.tsx";
import FormSkeleton from "../../../components/FormSkeleton.tsx";
import {
  calculateOrderSubtotal,
  calculateArtpayFee,
  calculatePaymentGatewayFee,
} from "../../cdspayments/utils/orderCalculations.ts";
import { PAYMENT_METHODS } from "../utils/constants.ts";

/**
 * Main auction checkout view component
 * Orchestrates the entire checkout flow
 */
const AuctionCheckoutView = () => {
  const {
    // State
    isReady,
    loading,
    isGuest,
    formValid,
    paymentMethod,
    order,
    artwork,
    guestData,
    isSaving,
    paymentIntent,

    // Handlers
    handleGuestFormSubmit,
    onChangePaymentMethod,

    // Utils
    showError,
  } = useAuctionCheckout();

  const navigate = useNavigate();

  // Handle order already completed
  useEffect(() => {
    if (order && order.status === "completed") {
      console.log("Order already completed, redirecting...");
      navigate(`/auction-checkout/complete/${order.id}`);
    }
  }, [order, navigate]);

  // Handle order not found
  useEffect(() => {
    if (isReady && !order) {
      console.error("Order not found");
      showError(undefined, "Ordine non trovato. Verifica il link ricevuto.");
    }
  }, [isReady, order, showError]);

  // Loading state
  if (loading || !isReady) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", py: 4 }}>
        <FormSkeleton />
      </Box>
    );
  }

  // Error state (no order)
  if (!order) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", py: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Ordine non trovato
        </Typography>
        <Typography color="text.secondary">
          Il link potrebbe essere scaduto o non valido. Contatta l'assistenza per maggiori
          informazioni.
        </Typography>
      </Box>
    );
  }

  // Calculate total for payment selection
  const subtotal = calculateOrderSubtotal(order);
  const artpayFee = calculateArtpayFee(order, subtotal);
  const gatewayFee =
    paymentMethod === PAYMENT_METHODS.KLARNA ? calculatePaymentGatewayFee(order) : 0;
  const total = subtotal + artpayFee + gatewayFee;

  // Render main checkout flow
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Grid container spacing={4}>
        {/* Left: Order Summary (Desktop) / Top (Mobile) */}
        <Grid item xs={12} md={5}>
          <Box sx={{ position: { md: "sticky" }, top: { md: 100 } }}>
            <AuctionOrderSummary
              artwork={artwork}
              order={order}
              paymentMethod={paymentMethod}
              showFees={!!paymentMethod}
            />
          </Box>
        </Grid>

        {/* Right: Main Content (Desktop) / Bottom (Mobile) */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Step indicator */}
            <Box>
              <Typography variant="overline" color="text.secondary">
                {!formValid
                  ? "Passo 1 di 3: Dati di fatturazione"
                  : !paymentMethod
                    ? "Passo 2 di 3: Metodo di pagamento"
                    : "Passo 3 di 3: Pagamento"}
              </Typography>
            </Box>

            {/* STEP 1: Guest Form (if guest and not valid) */}
            {isGuest && !formValid && (
              <GuestBillingForm
                onSubmit={handleGuestFormSubmit}
                initialData={guestData}
                disabled={isSaving}
              />
            )}

            {/* STEP 2: Payment Selection (if form valid and no method selected) */}
            {formValid && !paymentMethod && (
              <AuctionPaymentsSelection
                paymentMethod={paymentMethod}
                onChange={onChangePaymentMethod}
                orderTotal={total}
                disabled={isSaving}
              />
            )}

            {/* STEP 3: Payment Form (if method selected) */}
            {formValid && paymentMethod && (
              <AuctionPaymentCard
                paymentMethod={paymentMethod}
                paymentIntent={paymentIntent}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AuctionCheckoutView;