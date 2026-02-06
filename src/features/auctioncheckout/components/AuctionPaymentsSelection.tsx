import { Box, Typography } from "@mui/material";
import PaymentRadioSelector from "../../../components/PaymentRadioSelector.tsx";
import ContentCard from "../../../components/ContentCard.tsx";
import { PAYMENT_METHODS, KLARNA_MAX_LIMIT, KLARNA_FEE_MULTIPLIER } from "../utils/constants.ts";
import type { PaymentMethodOption } from "../types.ts";

interface AuctionPaymentsSelectionProps {
  paymentMethod: string | null;
  onChange: (method: string) => Promise<void>;
  orderTotal: number;
  disabled?: boolean;
}

// Payment method definitions
const PAYMENT_METHOD_OPTIONS: Record<string, PaymentMethodOption> = {
  card: {
    value: PAYMENT_METHODS.CARD,
    label: "Carta di credito",
    description: "Paga con carta di credito o debito",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  klarna: {
    value: PAYMENT_METHODS.KLARNA,
    label: "Klarna",
    description: "Paga in 3 rate senza interessi (fino a €2.500)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 6h16M4 12h16M4 18h10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
};

const AuctionPaymentsSelection = ({
  paymentMethod,
  onChange,
  orderTotal,
  disabled,
}: AuctionPaymentsSelectionProps) => {
  // Check if Klarna is available (total with fee must be <= €2,500)
  const totalWithKlarnaFee = orderTotal * KLARNA_FEE_MULTIPLIER;
  const isKlarnaAvailable = totalWithKlarnaFee <= KLARNA_MAX_LIMIT;

  const handleMethodChange = async (method: string) => {
    try {
      await onChange(method);
    } catch (error) {
      console.error("Error changing payment method:", error);
    }
  };

  return (
    <ContentCard title="Seleziona metodo di pagamento">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Klarna Section (if available) */}
        {isKlarnaAvailable && (
          <>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Pagamento dilazionato
            </Typography>

            <PaymentRadioSelector
              method={PAYMENT_METHOD_OPTIONS.klarna}
              selectedMethod={paymentMethod}
              onMethodChange={handleMethodChange}
              disabled={disabled}
            />
          </>
        )}

        {!isKlarnaAvailable && (
          <Box
            sx={{
              p: 2,
              bgcolor: "warning.light",
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Typography variant="body2" color="warning.dark">
              Klarna non disponibile per ordini superiori a €{KLARNA_MAX_LIMIT.toFixed(2)}
            </Typography>
          </Box>
        )}

        {/* Card Section */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Unica soluzione
        </Typography>

        <PaymentRadioSelector
          method={PAYMENT_METHOD_OPTIONS.card}
          selectedMethod={paymentMethod}
          onMethodChange={handleMethodChange}
          disabled={disabled}
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Seleziona il metodo di pagamento preferito per procedere.
        </Typography>
      </Box>
    </ContentCard>
  );
};

export default AuctionPaymentsSelection;