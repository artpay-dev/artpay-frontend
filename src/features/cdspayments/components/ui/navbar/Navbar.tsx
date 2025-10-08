import LogoFastArtpay from "../../../../../components/icons/LogoFastArtpay.tsx";
import { useNavigate } from "react-router-dom";
import { useDirectPurchaseStore } from "../../../../directpurchase";
import { useDialogs } from "../../../../../hoc/DialogProvider.tsx";
import { useData } from "../../../../../hoc/DataProvider.tsx";
import usePaymentStore from "../../../stores/paymentStore.ts";




const Navbar = () => {
  const navigate = useNavigate();
  const {pendingOrder, reset} = useDirectPurchaseStore()
  const dialogs = useDialogs()
  const data = useData();
  const { refreshOrders } = usePaymentStore()


  const handleClick = async () => {

    if (pendingOrder?.status === "pending" && !pendingOrder.customer_note.includes("Documentazione")) {
      const confirmed = await dialogs.yesNo(
        "Annulla transazione",
        "Vuoi davvero uscire? L'opera non rimarrà nel tuo carrello e la transazione verrà annullata.",
        {
          txtYes: "Annulla",
          txtNo: "Resta"
        }
      );

      if (!confirmed) return;

      try {
        // Cancella l'ordine
        if (pendingOrder?.id) {
          await data.setOrderStatus(pendingOrder.id, "cancelled");
        }

        // Pulisce il localStorage
        if (pendingOrder?.order_key) {
          const paymentIntentKeys = [
            `payment-intents-${pendingOrder.order_key}`,
            `payment-intents-cds-${pendingOrder.order_key}`,
            `payment-intents-redeem-${pendingOrder.order_key}`,
            `payment-intents-block-${pendingOrder.order_key}`,
            "completed-order"
          ];
          paymentIntentKeys.forEach(key => localStorage.removeItem(key));
        }

        // Resetta lo store
        reset();

        // Refresh ordini
        refreshOrders();

        // Naviga alla dashboard
        navigate("/dashboard");
      } catch (error) {
        console.error("Error cancelling order:", error);
        // Naviga comunque
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
  }

  return (
    <header className={"fixed w-full z-50 top-6 px-2 max-w-2xl md:px-0"}>
      <nav className={"p-4 custom-navbar flex justify-between items-center w-full bg-white "}>
        <button className={"text-tertiary cursor-pointer underline underline-offset-3 leading-[125%]"} onClick={handleClick}>
          Torna su artpay
        </button>

        <LogoFastArtpay />
      </nav>
    </header>
  );
};

export default Navbar;