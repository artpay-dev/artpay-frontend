import { Box, Typography, Divider } from "@mui/material";
import type { Order } from "../../../types/order.ts";
import type { ArtworkCardProps } from "../../../components/ArtworkCard.tsx";
import DisplayImage from "../../../components/DisplayImage.tsx";
import ContentCard from "../../../components/ContentCard.tsx";
import {
  calculateOrderSubtotal,
  calculateArtpayFee,
  calculatePaymentGatewayFee,
} from "../../cdspayments/utils/orderCalculations.ts";
import { PAYMENT_METHODS } from "../utils/constants.ts";

interface AuctionOrderSummaryProps {
  artwork: ArtworkCardProps | null;
  order: Order | null;
  paymentMethod: string | null;
  showFees?: boolean;
}

const AuctionOrderSummary = ({
  artwork,
  order,
  paymentMethod,
  showFees = true,
}: AuctionOrderSummaryProps) => {
  if (!order) {
    return (
      <ContentCard title="Riepilogo Ordine">
        <Typography color="text.secondary">Caricamento...</Typography>
      </ContentCard>
    );
  }

  // Calculate pricing
  const subtotal = calculateOrderSubtotal(order);
  const artpayFee = calculateArtpayFee(order, subtotal);
  const gatewayFee =
    paymentMethod === PAYMENT_METHODS.KLARNA ? calculatePaymentGatewayFee(order) : 0;
  const total = subtotal + artpayFee + gatewayFee;

  // Get order description
  const orderDesc =
    order.meta_data?.find((meta) => meta.key === "original_order_desc")?.value ||
    "Acquisto asta";

  // Get vendor name
  const vendorName =
    order.meta_data?.find((meta) => meta.key === "vendor_name")?.value || "Casa d'asta";

  return (
    <ContentCard title="Riepilogo Ordine">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Artwork Image */}
        {artwork?.image && (
          <Box
            sx={{
              width: "100%",
              aspectRatio: "4/3",
              borderRadius: 1,
              overflow: "hidden",
              bgcolor: "grey.100",
            }}
          >
            <DisplayImage
              src={artwork.image}
              width="100%"
              height="100%"
              objectFit="cover"
            />
          </Box>
        )}

        {/* Order Details */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Descrizione
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {orderDesc}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tipo
          </Typography>
          <Typography variant="body1">Casa d'asta</Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Venditore
          </Typography>
          <Typography variant="body1">{vendorName}</Typography>
        </Box>

        <Divider />

        {/* Price Breakdown */}
        {showFees && (
          <>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Prezzo base
                </Typography>
                <Typography variant="body2">€ {subtotal.toFixed(2)}</Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Commissione Artpay (4%)
                </Typography>
                <Typography variant="body2">€ {artpayFee.toFixed(2)}</Typography>
              </Box>

              {paymentMethod === PAYMENT_METHODS.KLARNA && gatewayFee > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Commissione Klarna (5%)
                  </Typography>
                  <Typography variant="body2">€ {gatewayFee.toFixed(2)}</Typography>
                </Box>
              )}

              <Divider />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Totale</Typography>
                <Typography variant="h6" fontWeight={600}>
                  € {total.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Typography variant="caption" color="text.secondary">
              Tutti i prezzi sono IVA inclusa (22%)
            </Typography>
          </>
        )}

        {!showFees && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Prezzo
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              € {subtotal.toFixed(2)}
            </Typography>
          </Box>
        )}
      </Box>
    </ContentCard>
  );
};

export default AuctionOrderSummary;