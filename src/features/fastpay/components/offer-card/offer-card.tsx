import CountdownTimer from "../../../../components/CountdownTimer.tsx";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert } from "@mui/material";
import { Order } from "../../../../types/order.ts";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { quoteService } from "../../../../services/quoteService.ts";
import useListDrawStore from "../../stores/listDrawStore.tsx";

interface OfferCardProps {
  order: Order | Partial<Order>;
  sharingButton?: boolean;
  onDeleted?: () => void;
}

const OfferCard = ({ order, sharingButton = false, onDeleted }: OfferCardProps) => {
  const navigate = useNavigate();
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
  const { setOpenListDraw } = useListDrawStore();

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

    if (!order.id) {
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
    if (!order.id) {
      setDeleteError("ID ordine non disponibile");
      return;
    }

    try {
      setDeletingQuote(true);
      setDeleteError("");

      await quoteService.deleteQuote(order.id);

      setOpenDeleteDialog(false);

      // Chiama la callback per notificare il componente padre
      if (onDeleted) {
        onDeleted();
      }
    } catch (error: any) {
      console.error("Errore nell'eliminazione dell'offerta:", error);
      setDeleteError(error?.response?.data?.message || error?.message || "Errore nell'eliminazione dell'offerta");
    } finally {
      setDeletingQuote(false);
    }
  };

  return (
    <>
    <li className={"border border-[#E2E6FC] rounded-lg space-y-4 max-w-sm"}>
      <div className={"card-header pt-4 px-4"}>
        <span>Offerta N.{order.number || "---"}</span>
        <div className="flex items-center gap-3 my-4">
          <img
            src={mainItem?.image?.src || "/images/immagine--galleria.png"}
            alt={mainItem?.name || "Artwork"}
            width={400}
            height={400}
            className="rounded-sm object-cover h-8 w-8 aspect-square"
          />
          <div className={"flex flex-col"}>
            <span>{mainItem?.name || "Opera d'arte"}</span>
            <span className={"text-secondary text-xs"}>
              {order.billing?.first_name} {order.billing?.last_name}
            </span>
          </div>
        </div>
      </div>
      <div className={"card-body px-4"}>
        {hasExpiryDate && expiryDate && (
          <>
            <span className={"text-secondary block mb-1"}>L'offerta scade tra:</span>
            <CountdownTimer expiryDate={expiryDate} />
          </>
        )}
        <ul className={`flex flex-col gap-4 ${hasExpiryDate ? "mt-4" : ""}`}>
          <li className={"flex flex-col gap-1"}>
            <span className={"text-secondary"}>Prezzo</span>
            <span>
              {order.currency_symbol || "€"} {parseFloat(order.total || "0").toFixed(2)}
            </span>
          </li>
          {parseFloat(order.discount_total || "0") > 0 && (
            <li className={"flex flex-col gap-1"}>
              <span className={"text-secondary"}>Sconto</span>
              <span>{discountPercentage}&nbsp;%</span>
            </li>
          )}
        </ul>
      </div>
      <div className={"card-footer border-t border-[#E2E6FC] text-secondary p-4 flex flex-col gap-4"}>
        {sharingButton ? (
          <Button variant={"contained"} onClick={handleShareClick}>Condividi</Button>
        ) : (
          <>
            <Button variant={"outlined"} onClick={() => {
              setOpenListDraw({openListDraw: false});
              navigate(`/vendor/fastpay/offerta/${order.id}`)
            }}>
              Vedi dettaglio
            </Button>
            <Button variant={"text"} color={"inherit"} onClick={handleDeleteClick}>
              Elimina offerta
            </Button>
          </>
        )}
      </div>
    </li>

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

export default OfferCard;