import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Order } from "../../types/order.ts";
import { quoteService } from "../../services/quoteService.ts";
import {
  CircularProgress,
  Typography,
  Alert,
  Button,
  Box,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CountdownTimer from "../../components/CountdownTimer.tsx";

const FastPayDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingQuote, setDeletingQuote] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const vendorUserStr = localStorage.getItem("vendor-user");
        if (!vendorUserStr) {
          setError("Vendor non autenticato");
          return;
        }

        const vendorUser = JSON.parse(vendorUserStr);
        const vendorId = vendorUser.id || vendorUser.vendor_id;

        if (!vendorId) {
          setError("ID vendor non trovato");
          return;
        }

        // Carica tutti gli ordini del vendor
        const vendorOrders = await quoteService.getVendorQuotes(vendorId);

        // Trova l'ordine specifico
        const foundOrder = vendorOrders.find((o) => o.id === Number(orderId));

        if (!foundOrder) {
          setError("Offerta non trovata");
          return;
        }

        setOrder(foundOrder);
      } catch (err: any) {
        console.error("Errore nel caricamento del dettaglio:", err);
        setError(err?.response?.data?.message || "Errore nel caricamento dell'offerta");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const handleShareClick = () => {
    setOpenEmailDialog(true);
    setEmailError("");
    setEmailSuccess(false);
  };

  const handleSendEmail = async () => {
    if (!customerFirstName.trim()) {
      setEmailError("Inserisci il nome del cliente");
      return;
    }

    if (!customerLastName.trim()) {
      setEmailError("Inserisci il cognome del cliente");
      return;
    }

    if (!customerEmail || !customerEmail.includes("@")) {
      setEmailError("Inserisci un'email valida");
      return;
    }

    if (!order?.id) {
      setEmailError("ID ordine non disponibile");
      return;
    }

    try {
      setSendingEmail(true);
      setEmailError("");

      await quoteService.updateOrderEmail(order.id, customerEmail, customerFirstName, customerLastName);

      setEmailSuccess(true);
      setTimeout(() => {
        setOpenEmailDialog(false);
        setCustomerEmail("");
        setCustomerFirstName("");
        setCustomerLastName("");
        setEmailSuccess(false);
      }, 2000);
      navigate("/vendor/fastpay");
    } catch (error: any) {
      console.error("Errore nell'invio dell'email:", error);
      setEmailError(error?.response?.data?.message || error?.message || "Errore nell'invio dell'email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    setDeleteError("");
  };

  const handleDeleteConfirm = async () => {
    if (!order?.id) {
      setDeleteError("ID ordine non disponibile");
      return;
    }

    try {
      setDeletingQuote(true);
      setDeleteError("");

      await quoteService.deleteQuote(order.id);

      setOpenDeleteDialog(false);

      // Torna alla pagina principale FastPay
      navigate("/vendor/fastpay");
    } catch (error: any) {
      console.error("Errore nell'eliminazione dell'offerta:", error);
      setDeleteError(error?.response?.data?.message || error?.message || "Errore nell'eliminazione dell'offerta");
    } finally {
      setDeletingQuote(false);
    }
  };

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center py-12 max-w-lg mx-auto">
        <CircularProgress size={40} />
        <Typography variant="body2" className="mt-4 text-white">
          Caricamento dettagli...
        </Typography>
      </main>
    );
  }

  if (error) {
    return (
      <main className="px-8 py-12 max-w-lg mx-auto">
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/vendor/fastpay")}
          sx={{ mt: 3 }}
        >
          Torna indietro
        </Button>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  // Cerca la data di scadenza nei meta_data
  const expiryDateMeta = order.meta_data?.find((meta) => meta.key === "quote_expiry_date");
  const hasExpiryDate = !!expiryDateMeta;
  const expiryDate = hasExpiryDate ? new Date(expiryDateMeta.value) : null;

  // Prendi la percentuale di sconto direttamente dal coupon_data se disponibile
  const couponLine = order.coupon_lines?.[0];
  const couponData = couponLine?.meta_data?.find((meta: any) => meta.key === "coupon_data")?.value;
  const discountPercentage = couponData?.amount || "0";

  // Prendi il primo line_item per mostrare i dettagli principali
  const mainItem = order.line_items?.[0];

  // Determina se l'offerta è stata condivisa controllando se c'è una email cliente
  const hasBeenShared = !!(order.billing?.email && order.billing.email !== "");

  return (
    <>
      <main className="text-white w-full max-w-lg mx-auto px-6">
        <h1 className="text-4xl font-light mb-8">Dettaglio Offerta</h1>

        <div className="bg-white rounded-t-3xl p-6 space-y-6">
          {/* Header con immagine e info base */}
          <div className="flex items-start gap-4">
            <img
              src={mainItem?.image?.src || "/images/placeholder.svg"}
              alt={mainItem?.name || "Artwork"}
              className="rounded-lg object-cover w-24 h-24"
            />
            <div className="flex-1">
              <Typography variant="h6" className="!font-semibold text-tertiary">
                Offerta N.{order.number}
              </Typography>
              <Typography variant="body1" className="!mt-1 text-tertiary">
                {mainItem?.name || "Opera d'arte"}
              </Typography>
              {order.billing?.first_name && (
                <Typography variant="body2" className="!mt-1 text-tertiary">
                  Cliente: {order.billing.first_name} {order.billing.last_name}
                </Typography>
              )}
              {order.billing?.email && (
                <Typography variant="body2" className="!mt-1 text-tertiary">
                  Email: {order.billing.email}
                </Typography>
              )}
            </div>
          </div>

          <Divider />

          {/* Timer scadenza */}
          {hasExpiryDate && expiryDate && (
            <Box className={'mt-6'}>
              <Typography variant="body2" color="text.secondary" className="!mb-2">
                L'offerta scade tra:
              </Typography>
              <CountdownTimer expiryDate={expiryDate} />
            </Box>
          )}

          {/* Dettagli prezzo */}
          <Box className="space-y-4">
            {parseFloat(order.discount_total || "0") > 0 && (
              <div>
                <Typography variant="body2" color="text.secondary">
                  Prezzo di partenza:
                </Typography>
                <Typography variant="body1" className="!mt-1 text-tertiary">
                  {order.currency_symbol || "€"} {(parseFloat(order.total || "0") + parseFloat(order.discount_total || "0") * 1.05).toFixed(2)}
                </Typography>
              </div>
            )}

            <div>
              <Typography variant="body2" color="text.secondary">
                Prezzo finale:
              </Typography>
              <Typography variant="body1" className="!mt-1 text-tertiary">
                {order.currency_symbol || "€"} {parseFloat(order.total || "0").toFixed(2)}
              </Typography>
            </div>

            {parseFloat(order.discount_total || "0") > 0 && (
              <div>
                <Typography variant="body2" color="text.secondary">
                  Sconto applicato:
                </Typography>
                <Typography variant="body1" className={'text-tertiary !mb-4 !mt-1'}>{discountPercentage}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Risparmio:
                </Typography>
                <Typography variant="body1" className={'text-tertiary !mt-1'}>
                  {order.currency_symbol || "€"} {(parseFloat(order.discount_total || "0") * 1.05).toFixed(2)}
                </Typography>
              </div>
            )}

            {mainItem?.meta_data && mainItem.meta_data.length > 0 && (
              <div>
                <Typography variant="body2" color="text.secondary">
                  Descrizione opera
                </Typography>
                <Typography variant="body1" className="!mt-1">
                  {mainItem.meta_data.find((m: any) => m.key === "_product_description")?.value || "N/A"}
                </Typography>
              </div>
            )}
          </Box>

          <Divider />

          {/* Azioni */}
          <Box className="flex flex-col gap-4 !mt-6">
            <Button
              variant="contained"
              fullWidth
              onClick={handleShareClick}
              disabled={hasBeenShared}
            >
              {hasBeenShared ? "Già condivisa" : "Condividi offerta"}
            </Button>

            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={handleDeleteClick}
            >
              Elimina offerta
            </Button>
          </Box>
        </div>
      </main>

      {/* Dialog per inserire l'email del cliente */}
      <Dialog
        open={openEmailDialog}
        onClose={() => !sendingEmail && setOpenEmailDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>Invia offerta al cliente</DialogTitle>
        <DialogContent>
          {emailSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Email inviata con successo!
            </Alert>
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Nome cliente"
                type="text"
                fullWidth
                variant="outlined"
                value={customerFirstName}
                onChange={(e) => setCustomerFirstName(e.target.value)}
                disabled={sendingEmail}
                sx={{
                  mt: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                margin="dense"
                label="Cognome cliente"
                type="text"
                fullWidth
                variant="outlined"
                value={customerLastName}
                onChange={(e) => setCustomerLastName(e.target.value)}
                disabled={sendingEmail}
                sx={{
                  mt: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                margin="dense"
                label="Email cliente"
                type="email"
                fullWidth
                variant="outlined"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError}
                disabled={sendingEmail}
                sx={{
                  mt: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenEmailDialog(false)} disabled={sendingEmail}>
            Annulla
          </Button>
          <Button
            onClick={handleSendEmail}
            variant="contained"
            disabled={sendingEmail || emailSuccess}
            startIcon={sendingEmail ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {sendingEmail ? "Invio..." : "Invia"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog di conferma eliminazione */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => !deletingQuote && setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>Conferma eliminazione</DialogTitle>
        <DialogContent>
          {deleteError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          ) : (
            <p className="mt-4 text-secondary">
              Sei sicuro di voler eliminare l'offerta N.{order.number}?
              <br />
              Questa azione non può essere annullata.
            </p>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={deletingQuote}>
            Annulla
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deletingQuote}
            startIcon={deletingQuote ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {deletingQuote ? "Eliminazione..." : "Elimina"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FastPayDetail;