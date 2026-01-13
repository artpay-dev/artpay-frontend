import { useState } from "react";
import CountdownTimer from "../../../components/CountdownTimer.tsx";
import { Button, CircularProgress } from "@mui/material";
import { OrderHistoryCardProps } from "../../../components/OrderHistoryCard.tsx";
import { quoteService } from "../../../services/quoteService.ts";

const TransactionCard = ({
  id,
  formattePrice,
  dateCreated,
  purchaseMode,
  title,
  imgSrc,
  onClick,
  orderType,
  status,
  expiryDate,
  customer_note,
  galleryName,
  quoteNotes,
  quoteConditions,
  orderKey,
  email,
  onQuoteAccepted,
  onQuoteRejected,
}: OrderHistoryCardProps) => {
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<"accepted" | "rejected" | null>(null);

  const handleAcceptQuote = async () => {
    console.log("🔍 Debug Accept Quote:", { orderKey, email, id });

    if (!orderKey || !email) {
      alert(`Dati mancanti per accettare il preventivo.\nOrder Key: ${orderKey || "mancante"}\nEmail: ${email || "mancante"}`);
      return;
    }

    try {
      setLoading(true);
      await quoteService.acceptQuote({ order_key: orderKey, email });
      setActionStatus("accepted");

      // Chiama callback se fornito
      if (onQuoteAccepted) {
        onQuoteAccepted();
      }
    } catch (error) {
      console.error("Errore nell'accettazione del preventivo:", error);
      alert("Errore nell'accettazione del preventivo. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectQuote = async () => {
    if (!orderKey || !email) {
      alert("Dati mancanti per rifiutare il preventivo");
      return;
    }

    const confirmed = window.confirm("Sei sicuro di voler rifiutare questo preventivo?");
    if (!confirmed) return;

    try {
      setLoading(true);
      await quoteService.rejectQuote({ order_key: orderKey, email });
      setActionStatus("rejected");

      // Chiama callback se fornito
      if (onQuoteRejected) {
        onQuoteRejected();
      }
    } catch (error) {
      console.error("Errore nel rifiuto del preventivo:", error);
      alert("Errore nel rifiuto del preventivo. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const getExpiryDate = (): Date => {
    // Se abbiamo una expiryDate dall'ordine, usala
    if (expiryDate) {
      return new Date(expiryDate);
    }
    // Altrimenti calcola 7 giorni dalla data di creazione dell'ordine
    if (dateCreated) {
      const createdDate = new Date(dateCreated);
      const calculatedExpiry = new Date(createdDate);
      calculatedExpiry.setDate(createdDate.getDate() + 7);
      return calculatedExpiry;
    }
    // Fallback: 7 giorni da ora se non abbiamo nessuna data
    const now = new Date();
    const fallbackExpiry = new Date(now);
    fallbackExpiry.setDate(now.getDate() + 7);
    return fallbackExpiry;
  };

  return (
    <div className="flex flex-col h-full border border-[#E2E6FC] rounded-lg max-w-md">
      <div className={"card-header flex p-4 gap-3 items-center justify-between border-b border-[#E2E6FC]"}>
        <div className="flex gap-3 items-center">
          {imgSrc && (
            <div className={"overflow-hidden size-8 rounded-md"}>
              <img src={imgSrc} alt="Img order" className={"object-cover h-full w-full"} />
            </div>
          )}
          <div className={"flex flex-col gap-1 max-w-[120px] md:max-w-[200px]"}>
            <span className="truncate">{title}</span>
          </div>
        </div>
        <div className={"flex flex-col gap-1"}>
          <strong>{formattePrice}</strong>
        </div>
      </div>
      <div className={"card-body flex-1 min-h-20 p-4 flex-col space-y-4"}>
        <div className={"flex flex-col "}>
          <span>Tipo:</span>
          <span className={"text-secondary"}>{orderType}</span>
        </div>
        <div className={"flex flex-col "}>
          <span>Venditore:</span>
          <span className={"text-secondary"}>{galleryName}</span>
        </div>
        {quoteConditions && (
          <div className={"flex flex-col "}>
            <span>Condizioni:</span>
            <span className={"text-secondary"}>{quoteConditions}</span>
          </div>
        )}
        {quoteNotes && (
          <div className={"flex flex-col "}>
            <span>Condizioni:</span>
            <span className={"text-secondary"}>{quoteNotes}</span>
          </div>
        )}

        {purchaseMode.includes("Blocco opera") &&
          customer_note?.includes("Richiesta cancellazione") &&
          status !== "cancelled" &&
          status !== "failed" && (
            <div className={"space-y-1"}>
              <p className={"text-secondary"}>Scadenza della prenotazione</p>
              <CountdownTimer expiryDate={getExpiryDate()} />
            </div>
          )}

        {status === "failed" ? (
          <div className={"w-full rounded-sm bg-[#EC6F7B40] p-4 space-y-2 flex flex-col"}>
            <span className={"px-2 py-1 rounded-full text-xs font-medium bg-[#EC6F7B] text-white w-fit"}>
              Transazione fallita
            </span>
          </div>
        ) : status === "cancelled" ? (
          <div className={"w-full rounded-sm bg-[#EC6F7B40] p-4 space-y-2 flex flex-col"}>
            <span className={"px-2 py-1 rounded-full text-xs font-medium bg-[#EC6F7B] text-white w-fit"}>
              Transazione annullata
            </span>
          </div>
        ) : customer_note?.includes("Richiesta di cancellazione") ? (
          <div className={"w-full rounded-sm bg-[#EC6F7B40] p-4 space-y-2 flex flex-col"}>
            <span className={"px-2 py-1 rounded-full text-xs font-medium bg-[#EC6F7B] text-white w-fit"}>
              Richiesta di cancellazione in corso
            </span>
            <div className={"flex flex-col gap-1"}>
              <span className={"text-secondary"}>Stato</span>
              <span>La richiesta di cancellazione è stata inviata alla galleria.</span>
            </div>
          </div>
        ) : customer_note ? (
          <div
            className={`w-full rounded-sm p-4 space-y-2 flex flex-col ${
              customer_note.includes("Ottenuto") ? "bg-[#42B3964D]" : "bg-[#FED1824D] "
            }`}>
            {purchaseMode?.includes("Blocco opera") && (
              <span className={"px-2 py-1 rounded-full text-xs font-medium bg-[#6576EE] text-white w-fit"}>
                Opera prenotata
              </span>
            )}
            <div className={"flex flex-col gap-1"}>
              <span className={"text-secondary"}>{customer_note.includes("Ottenuto") ? "Prestito" : "Stato"}</span>
              <span>{customer_note}</span>
            </div>
          </div>
        ) : status === "quote" ? (
          <></>
        ) : (
          <div className={"flex flex-col gap-1 bg-[#FED1824D] p-4 space-y-2 rounded-sm"}>
            <span className={"text-secondary"}>{customer_note?.includes("Ottenuto") ? "Prestito" : "Stato"}</span>
            <span>{customer_note || "Pagamento da completare"}</span>
          </div>
        )}
      </div>

      {onClick && !customer_note?.includes("Richiesta di cancellazione") && (
        <div className={"card-footer border-t border-[#E2E6FC] p-4"}>
          <Button sx={{ mt: 2, width: "100%" }} onClick={() => onClick(id)} variant="outlined">
            Gestisci transazione
          </Button>
        </div>
      )}

      {status === "quote" && !actionStatus && (
        <div>
          <div className={"card-footer border-t border-[#E2E6FC] px-4 pt-4"}>
            <Button
              sx={{ mt: 2, width: "100%" }}
              variant="outlined"
              color={"success"}
              onClick={handleAcceptQuote}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : undefined}>
              {loading ? "Accettazione in corso..." : "Accetta"}
            </Button>
          </div>
          <div className={"px-4 pb-4"}>
            <Button
              sx={{ mt: 2, width: "100%" }}
              variant="outlined"
              color={"error"}
              onClick={handleRejectQuote}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : undefined}>
              {loading ? "Rifiuto in corso..." : "Rifiuta"}
            </Button>
          </div>
        </div>
      )}

      {actionStatus === "accepted" && (
        <div className={"card-footer border-t border-[#E2E6FC] p-4"}>
          <div className={"w-full rounded-sm bg-[#42B3964D] p-4 space-y-2 flex flex-col"}>
            <span className={"px-2 py-1 rounded-full text-xs font-medium bg-[#42B396] text-white w-fit"}>
              Preventivo accettato
            </span>
            <div className={"flex flex-col gap-1"}>
              <span>Il preventivo è stato accettato con successo. Riceverai un'email con le istruzioni per il pagamento.</span>
            </div>
          </div>
        </div>
      )}

      {actionStatus === "rejected" && (
        <div className={"card-footer border-t border-[#E2E6FC] p-4"}>
          <div className={"w-full rounded-sm bg-[#EC6F7B40] p-4 space-y-2 flex flex-col"}>
            <span className={"px-2 py-1 rounded-full text-xs font-medium bg-[#EC6F7B] text-white w-fit"}>
              Preventivo rifiutato
            </span>
            <div className={"flex flex-col gap-1"}>
              <span>Il preventivo è stato rifiutato.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;
