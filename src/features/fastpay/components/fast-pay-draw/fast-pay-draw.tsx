import { Close } from "@mui/icons-material";
import useListDrawStore from "../../stores/listDrawStore.tsx";
import PlusIcon from "../../../../components/icons/PlusIcon.tsx";
import { useNavigate } from "react-router-dom";
import OfferCard from "../offer-card/offer-card.tsx";
import { useEffect, useState } from "react";
import { Order } from "../../../../types/order.ts";
import { quoteService } from "../../../../services/quoteService.ts";
import { CircularProgress, Typography, Alert } from "@mui/material";

const FastPayDraw = () => {
  const navigate = useNavigate();
  const { openListDraw, setOpenListDraw } = useListDrawStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadVendorQuotes = async () => {
      try {
        setLoading(true);
        setError("");

        // Recupera il vendor-user dal localStorage
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

        // Carica gli ordini del vendor con status "quote"
        const vendorOrders = await quoteService.getVendorQuotes(vendorId);
        setOrders(vendorOrders);
      } catch (err: any) {
        console.error("Errore nel caricamento degli ordini:", err);
        setError(err?.response?.data?.message || "Errore nel caricamento delle offerte");
      } finally {
        setLoading(false);
      }
    };

    // Carica gli ordini solo quando il drawer è aperto
    if (openListDraw) {
      loadVendorQuotes();
    }
  }, [openListDraw]);

  return (
    <aside
      className={`${
        openListDraw ? "" : "translate-y-full md:translate-y-0 md:translate-x-full"
      } py-6 payment-draw fixed w-full z-50 rounded-t-3xl bottom-0 h-4/5 bg-white transition-all  md:rounded-s-3xl md:rounded-tr-none md:overflow-y-hidden md:top-0 md:right-0 md:h-screen  md:max-w-sm`}>
      <div className={"fixed bg-white px-8 w-full max-w-md md:pe-24"}>
        <div className={"w-full h-12 mb-4"}>
          <button
            className={" cursor-pointer bg-gray-100 rounded-full p-3 float-right"}
            onClick={() => setOpenListDraw({ openListDraw: false })}>
            <Close />
          </button>
        </div>
        <div className={"flex items-center justify-between"}>
          <div className={"space-y-2"}>
            <h3 className={"text-2xl leading-6"}>Lista offerte</h3>
            <h3 className={"text-secondary leading-6"}>Offerte inviate</h3>
          </div>
          <button
            className={"bg-primary rounded-full p-3"}
            onClick={() => {
              setOpenListDraw({ openListDraw: false });
              navigate("/vendor/fastpay/crea-offerta");
            }}>
            <PlusIcon color="inherit" style={{ fontSize: "1.5rem", cursor: "pointer", fill: "white" }} />
          </button>
        </div>
      </div>
      <section className={"mt-40 overflow-y-scroll pb-60 h-full"}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CircularProgress size={40} />
            <Typography variant="body2" className="mt-4 text-secondary">
              Caricamento offerte...
            </Typography>
          </div>
        ) : error ? (
          <div className="px-8 py-4">
            <Alert severity="error">{error}</Alert>
          </div>
        ) : orders.length === 0 ? (
          <div className="px-8 py-12">
            <Typography variant="body1" className="text-center text-secondary">
              Nessuna offerta disponibile. Crea la tua prima offerta!
            </Typography>
          </div>
        ) : (
          <ul className={"flex flex-col gap-6 mt-4 px-8"}>
            {orders.map((order) => (
              <OfferCard key={order.id} order={order} />
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
};

export default FastPayDraw;
