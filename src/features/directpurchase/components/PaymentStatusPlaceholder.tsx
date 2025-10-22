import { Box, Typography, Button } from "@mui/material";
import { Check, Error, Home } from "@mui/icons-material";
import { Link } from "react-router-dom";
import PaymentProviderCard from "../../cdspayments/components/ui/paymentprovidercard/PaymentProviderCard.tsx";

interface PaymentStatusPlaceholderProps {
  status: "completed" | "failed" | "cancelled";
  orderNumber?: string | number;
  orderTotal?: string;
  onReturnHome?: () => void;
}

const PaymentStatusPlaceholder = ({
  status,
  orderNumber,
  orderTotal,
}: PaymentStatusPlaceholderProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          icon: <Check sx={{ fontSize: 64, color: "#4CAF50" }} />,
          title: "Pagamento completato!",
          message: "Il tuo ordine è stato elaborato con successo.",
          messageSecondary: "Riceverai a breve una email di conferma con tutti i dettagli.",
          bgColor: "bg-green-50",
          textColor: "text-green-800",
          buttonText: "Torna alla home",
          buttonColor: "success" as const
        };
      case "failed":
        return {
          icon: <Error sx={{ fontSize: 64, color: "#F44336" }} />,
          title: "Pagamento fallito",
          message: "Si è verificato un errore durante l'elaborazione del pagamento.",
          messageSecondary: "Puoi riprovare o contattare il supporto per assistenza.",
          bgColor: "bg-red-50",
          textColor: "text-red-800",
          buttonText: "Riprova",
          buttonColor: "error" as const
        };
      case "cancelled":
        return {
          icon: <Error sx={{ fontSize: 64, color: "#FF9800" }} />,
          title: "Pagamento annullato",
          message: "Il pagamento è stato annullato.",
          messageSecondary: "Puoi riprovare quando vuoi.",
          bgColor: "bg-orange-50",
          textColor: "text-orange-800",
          buttonText: "Riprova",
          buttonColor: "warning" as const
        };
      default:
        return {
          icon: <Error sx={{ fontSize: 64, color: "#9E9E9E" }} />,
          title: "Stato sconosciuto",
          message: "Non siamo riusciti a determinare lo stato del pagamento.",
          messageSecondary: "Contatta il supporto per assistenza.",
          bgColor: "bg-gray-50",
          textColor: "text-gray-800",
          buttonText: "Torna alla home",
          buttonColor: "inherit" as const
        };
    }
  };

  const config = getStatusConfig();

  return (
    <PaymentProviderCard className="w-full">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        py={6}
        px={4}
        className={config.bgColor}
        borderRadius={2}
      >
        {config.icon}

        <Typography
          variant="h4"
          fontWeight={600}
          className={config.textColor}
          sx={{ mt: 3, mb: 2 }}
        >
          {config.title}
        </Typography>

        <Typography
          variant="body1"
          className={config.textColor}
          sx={{ mb: 1, opacity: 0.8 }}
        >
          {config.message}
        </Typography>

        <Typography
          variant="body2"
          className={config.textColor}
          sx={{ mb: 4, opacity: 0.7 }}
        >
          {config.messageSecondary}
        </Typography>

        {orderNumber && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              backgroundColor: 'rgba(255,255,255,0.7)',
              borderRadius: 1,
              minWidth: '200px'
            }}
          >
            <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
              Numero ordine
            </Typography>
            <Typography variant="h6" fontWeight={500}>
              #{orderNumber}
            </Typography>
            {orderTotal && status === "completed" && (
              <>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 0.5 }}>
                  Totale pagato
                </Typography>
                <Typography variant="h6" fontWeight={500}>
                  € {orderTotal}
                </Typography>
              </>
            )}
          </Box>
        )}

        <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
          {status === "completed" ? (
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                color={config.buttonColor}
                size="large"
                startIcon={<Home />}
                sx={{ minWidth: '160px' }}
              >
                {config.buttonText}
              </Button>
            </Link>
          ) : (
            <>
              <Button
                variant="outlined"
                color={config.buttonColor}
                size="large"
                onClick={() => window.location.reload()}
                sx={{ minWidth: '120px' }}
              >
                {config.buttonText}
              </Button>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<Home />}
                  sx={{ minWidth: '160px' }}
                >
                  Torna alla home
                </Button>
              </Link>
            </>
          )}
        </Box>

        {status === "completed" && (
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            <Typography variant="body2" color="textSecondary">
              Hai domande? <Link to="/contatti" className="text-primary underline">Contattaci</Link>
            </Typography>
          </Box>
        )}
      </Box>
    </PaymentProviderCard>
  );
};

export default PaymentStatusPlaceholder;