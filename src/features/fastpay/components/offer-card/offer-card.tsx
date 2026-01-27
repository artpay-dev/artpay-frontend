import CountdownTimer from "../../../../components/CountdownTimer.tsx";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Chip, Tabs, Tab, Box } from "@mui/material";
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
  const [customerPhone, setCustomerPhone] = useState("");
  const [sendMethod, setSendMethod] = useState<"email" | "whatsapp">("email");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [formError, setFormError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [isShared, setIsShared] = useState(false);
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

  // Controlla se l'offerta è stata rifiutata
  const isCancelled = order.status === "cancelled";
  const isOnHold = order.status === "on-hold";
  const isCompleted = order.status === "completed";

  const handleShareClick = () => {
    setOpenEmailDialog(true);
    setFormError("");
    setPhoneError("");
    setEmailSuccess(false);
    setSendMethod("email");
  };

  const handleSendEmail = async () => {
    // Reset errori
    setFormError("");
    setPhoneError("");

    if (!customerFirstName.trim()) {
      setFormError("Inserisci il nome del cliente");
      return;
    }

    if (!customerLastName.trim()) {
      setFormError("Inserisci il cognome del cliente");
      return;
    }

    if (!customerEmail || !customerEmail.includes("@")) {
      setFormError("Inserisci un'email valida");
      return;
    }

    // Validazione telefono per WhatsApp
    if (sendMethod === "whatsapp") {
      if (!customerPhone.trim()) {
        setPhoneError("Inserisci il numero di telefono");
        return;
      }
      // Validazione formato base del numero (solo numeri e spazi)
      const phoneRegex = /^[\d\s+]+$/;
      if (!phoneRegex.test(customerPhone)) {
        setPhoneError("Il numero di telefono non è valido");
        return;
      }
    }

    if (!order.id) {
      setFormError("ID ordine non disponibile");
      return;
    }

    try {
      setSendingEmail(true);
      setFormError("");
      setPhoneError("");

      const response: any = await quoteService.updateOrderEmail(
        order.id,
        customerEmail,
        customerFirstName,
        customerLastName,
        sendMethod,
        sendMethod === "whatsapp" ? customerPhone : undefined
      );

      console.log("Risposta backend:", response);

      // Se è WhatsApp e c'è un link, salvalo e aprilo automaticamente
      if (sendMethod === "whatsapp" && response?.whatsapp_link) {
        setWhatsappLink(response.whatsapp_link);
        console.log("Link WhatsApp generato:", response.whatsapp_link);

        // Apri WhatsApp automaticamente in una nuova finestra
        window.open(response.whatsapp_link, '_blank');
      }

      setEmailSuccess(true);
      setIsShared(true);

      // Se è WhatsApp, non chiudere automaticamente il dialog per mostrare il link
      if (sendMethod !== "whatsapp") {
        setTimeout(() => {
          setOpenEmailDialog(false);
          setCustomerEmail("");
          setCustomerFirstName("");
          setCustomerLastName("");
          setCustomerPhone("");
          setEmailSuccess(false);
          setWhatsappLink("");
          setSendMethod("email");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Errore nell'invio:", error);
      console.error("Dettagli errore:", error?.response?.data);
      setFormError(error?.response?.data?.message || error?.message || "Errore nell'invio dell'offerta");
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
    <li className={`border rounded-lg space-y-4 max-w-md ${isCancelled ? 'border-gray-300 opacity-75' : 'border-[#E2E6FC]'}`}>
      <div className={"card-header pt-4 px-4"}>
        <div className="flex items-center justify-between mb-2">
          <span>Offerta N.{order.number || "---"}</span>
          {isCancelled && (
            <Chip
              label="Rifiutata"
              size="small"
              color="error"
              sx={{
                fontWeight: 500,
                fontSize: '0.75rem',
              }}
            />
          )}
          {isOnHold && (
            <Chip
              label="Accettata"
              size="small"
              color="success"
              sx={{
                fontWeight: 500,
                fontSize: '0.75rem',
              }}
            />
          )}
          {isCompleted && (
            <Chip
              label="Completato"
              size="small"
              color="info"
              sx={{
                fontWeight: 500,
                fontSize: '0.75rem',
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-3 my-4">
          <img
            src={mainItem?.image?.src || "/images/placeholder.png"}
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
        {isCompleted && order.date_completed && (
          <div className="mb-4">
            <span className={"text-secondary block mb-1"}>Completato il:</span>
            <span className="font-medium">
              {new Date(order.date_completed).toLocaleDateString('it-IT', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}
        {hasExpiryDate && expiryDate && !isCompleted && (
          <>
            <span className={"text-secondary block mb-1"}>L'offerta scade tra:</span>
            <CountdownTimer expiryDate={expiryDate} />
          </>
        )}
        <ul className={`flex flex-col gap-4 ${(hasExpiryDate && !isCompleted) || isCompleted ? "mt-4" : ""}`}>
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
          <Button variant={"contained"} onClick={handleShareClick} disabled={isShared}>
            {isShared ? "Condivisa" : "Condividi"}
          </Button>
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
      <DialogTitle className={'text-center'}>Invia offerta al cliente</DialogTitle>
      <DialogContent>
        {emailSuccess ? (
          <>
            <Alert severity="success" sx={{ mt: 2 }}>
              {sendMethod === "email" ? "Email inviata con successo!" : "Link WhatsApp generato con successo!"}
            </Alert>
            {sendMethod === "whatsapp" && whatsappLink && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  component="a"
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ borderRadius: 2 }}
                >
                  Apri WhatsApp
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setOpenEmailDialog(false);
                    setCustomerEmail("");
                    setCustomerFirstName("");
                    setCustomerLastName("");
                    setCustomerPhone("");
                    setEmailSuccess(false);
                    setWhatsappLink("");
                    setSendMethod("email");
                  }}
                  sx={{ mt: 1, borderRadius: 2 }}
                >
                  Chiudi
                </Button>
              </Box>
            )}
          </>
        ) : (
          <>
            <Box sx={{ mt: 2 }}>
              <Tabs
                value={sendMethod}
                onChange={(_, newValue) => {
                  setSendMethod(newValue);
                  setFormError("");
                  setPhoneError("");
                }}
                aria-label="Metodo di invio"
                TabIndicatorProps={{ style: { display: 'none' } }}
                sx={{
                  minHeight: 'auto',
                  '& .MuiTabs-flexContainer': {
                    gap: 1,
                  },
                }}
              >
                <Tab
                  label="Email"
                  value="email"
                  sx={{
                    minHeight: '36px',
                    py: 1,
                    px: 3,
                    borderRadius: 24,
                    textTransform: 'none',
                    fontWeight: 500,
                    flex: 1,
                    '&.Mui-selected': {
                      bgcolor: '#6576EE',
                      color: 'white',
                      '&:hover': {
                        bgcolor: '#6576EE',
                      },
                    },
                    '&:not(.Mui-selected)': {
                      color: 'text.secondary',
                      bgcolor: '#f5f5f5',
                      '&:hover': {
                        bgcolor: '#e8e8e8',
                      },
                    },
                  }}
                />
                <Tab
                  label="WhatsApp"
                  value="whatsapp"
                  sx={{
                    minHeight: '36px',
                    py: 1,
                    px: 3,
                    borderRadius: 24,
                    textTransform: 'none',
                    fontWeight: 500,
                    flex: 1,
                    '&.Mui-selected': {
                      bgcolor: '#6576EE',
                      color: 'white',
                      '&:hover': {
                        bgcolor: '#6576EE',
                      },
                    },
                    '&:not(.Mui-selected)': {
                      color: 'text.secondary',
                      bgcolor: '#f5f5f5',
                      '&:hover': {
                        bgcolor: '#e8e8e8',
                      },
                    },
                  }}
                />
              </Tabs>
            </Box>
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
              error={!!formError && formError.includes("nome")}
              helperText={formError && formError.includes("nome") ? formError : ""}
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
              error={!!formError && formError.includes("cognome")}
              helperText={formError && formError.includes("cognome") ? formError : ""}
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
              disabled={sendingEmail}
              error={!!formError && formError.includes("email")}
              helperText={formError && formError.includes("email") ? formError : ""}
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            {sendMethod === "whatsapp" && (
              <TextField
                margin="dense"
                label="Numero di telefono"
                type="tel"
                fullWidth
                variant="outlined"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                error={!!phoneError}
                helperText={phoneError || "Formato: 3331234567"}
                disabled={sendingEmail}
                placeholder="3331234567"
                sx={{
                  mt: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            )}
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