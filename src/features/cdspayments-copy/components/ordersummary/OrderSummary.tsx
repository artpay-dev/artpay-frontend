import { Order } from "../../../../types/order.ts";
import { Gallery } from "../../../../types/gallery.ts";
import PaymentProviderCard from "../ui/paymentprovidercard/PaymentProviderCard.tsx";
import usePaymentStore from "../../stores/paymentStore.ts";

type OrderDetailsProps = {
  vendor: Gallery | null;
  order: Order | null;
}



const OrderSummary = ({vendor, order} : OrderDetailsProps ) => {
  const {orderNote} = usePaymentStore();
  const orderDesc = order?.meta_data.filter((data) => data.key == "original_order_desc").map((data) => data.value);
  const subtotal= !order?.fee_lines.length ? (Number(order?.total) / 1.06) : (Number(order?.total) / 1.124658)


  return (
    <div className={'space-y-4'}>
      <div className={'flex items-center gap-2.5'}>
        <div className={'min-h-8 min-w-8 max-h-8 max-w-8 overflow-hidden border border-gray-200 rounded-sm p-1 bg-white flex justify-center items-center'}>
          <img src={vendor?.shop.image} width={100} height={100} alt={vendor?.name} className={'object-center object-cover aspect-square'} />
        </div>
        <p className={"text-secondary"}>{orderDesc}</p>
      </div>
      <div className={'flex flex-col gap-1'}>
        <span className={"text-secondary"}>Tipo</span>
        <span className={"text-tertiary"}>Casa d'asta</span>
      </div>
      <div className={'flex flex-col gap-1'}>
        <span className={"text-secondary"}>Venditore</span>
        <span className={"text-tertiary"}>{vendor && vendor.display_name}</span>
      </div>
      <div className={'flex flex-col gap-1'}>
        <span className={"text-secondary"}>Prezzo</span>
        <span className={"text-tertiary"}>€&nbsp;{subtotal.toFixed(2)}</span>
      </div>
      {order?.status != "failed" ? (
        <PaymentProviderCard backgroundColor={'bg-[#FAFAFB]'}>
          <div className={'space-y-2'}>
            <span className={'text-[#808791] block'}>Stato</span>
            {orderNote != "" && orderNote != "Prestito ottenuto"  ? <p>{orderNote}</p> : order?.status == "completed" ? <p>Transazione conclusa</p> : <p>Pagamento da completare</p>}
          </div>
        </PaymentProviderCard>
      ) : (
        <PaymentProviderCard backgroundColor={'bg-[#FAFAFB]'}>
          <div className={'space-y-2'}>
            <span className={'text-[#808791] block'}>Stato</span>
            <p>Problemi durante l'elaborazione del pagamento.</p>
          </div>
        </PaymentProviderCard>
      )}
    </div>
  );
};

export default OrderSummary;