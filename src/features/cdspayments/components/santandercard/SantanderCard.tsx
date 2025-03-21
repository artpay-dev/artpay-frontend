import PaymentProviderCard from "../paymentprovidercard/PaymentProviderCard.tsx";
import ArtpayIcon from "../paymentprovidercard/ArtpayIcon.tsx";
import ArtpayButton from "../../../../components/artpaybutton/ArtpayButton.tsx";
import { PaymentProviderCardProps } from "../../types.ts";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import usePaymentStore from "../../store.ts";
import { calculateArtPayFee } from "../../utils.ts";
import { useData } from "../../../../hoc/DataProvider.tsx";
import AgreementCheckBox from "../agreementcheckbox/AgreementCheckBox.tsx";

const SantanderCard = ({ subtotal, disabled, paymentSelected = true }: Partial<PaymentProviderCardProps>) => {
  const [fee, setFee] = useState<number>(0);
  const data = useData();
  const { setPaymentData, order } = usePaymentStore();
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  const updatePaymentStatus = async () => {
    if(!order) return
    setPaymentData({
      loading: true,
    });
    try {
      const updateStatus = await data.setOrderStatus(order?.id, "processing");
      if (!updateStatus) throw new Error("update status failed");
      console.log('status updated to processing');

      setPaymentData({
        paymentStatus: "processing",
      })

    } catch (e) {
      console.error(e);
    } finally {
      setPaymentData({
        loading: false,
      })
    }
  };

  const handlingArtpaySelection = async (): Promise<void> => {
    if (!order) return;
    setPaymentData({
      loading: true,
    });
    try {
      const updatePayment = await data.updatePaymentIntent({
        wc_order_key: order?.order_key,
        payment_method: "santander",
      });
      if (!updatePayment) throw new Error("Error during updating payment intent");

      const updateOrder = await data.updateOrder(order.id, { payment_method: "santander" });
      if (!updateOrder) throw new Error("Error during updating payment intent");

      await data.getOnHoldOrder();

      setPaymentData({
        paymentMethod: "santander",
        paymentIntent: updatePayment,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPaymentData({
        loading: false,
      });
    }
  };

  useEffect(() => {
    if (order) {
      const artpayFee = calculateArtPayFee(order);
      setFee(artpayFee);
    }
  }, [order]);

  return (
    <PaymentProviderCard
      disabled={disabled}
      icon={<ArtpayIcon />}
      cardTitle={"Pagamento con prestito"}
      subtitle={"A partire da € 1500.00 fino a € 30000.00 Commissioni artpay: 6%"}
      paymentSelected={paymentSelected}>
      {paymentSelected ? (
        <>
          <ol className={"list-decimal ps-4 space-y-1 border-b border-zinc-300 pb-6"}>
            <li>Avvia finanziamento</li>
            <li>Calcola la rata e richiedi prestito</li>
            <li>Completa pagamento</li>
          </ol>
          <ul className={"space-y-4 py-4"}>
            <li className={"w-full flex justify-between"}>
              Subtotale: <span>€&nbsp;{subtotal?.toFixed(2)}</span>
            </li>
            <li className={"w-full flex justify-between"}>
              Commissioni artpay: <span>€&nbsp;{fee.toFixed(2)}</span>
            </li>
            <li className={"w-full flex justify-between"}>
              <strong>Totale:</strong> <strong>€&nbsp;{(Number(subtotal) + Number(fee)).toFixed(2)}</strong>
            </li>
          </ul>
          {order?.payment_method == "santander" ? (
            <>
              <AgreementCheckBox isChecked={isChecked} handleChange={handleCheckBox} />
              <button
                onClick={updatePaymentStatus}
                className={"artpay-button-style bg-primary text-white py-3! disabled:opacity-65"}
                disabled={!isChecked}>
                Avvia richiesta prestito
              </button>
              <button className={"w-full flex justify-center mb-4 mt-8"}>Annulla</button>
            </>
          ) : (
            <>
              <div className={"flex justify-center"}>
                <ArtpayButton onClick={handlingArtpaySelection} disabled={disabled} />
              </div>
              <NavLink to={"/"} className={"text-tertiary underline underline-offset-2 mt-8 block"}>
                Scopri di più
              </NavLink>
            </>
          )}
        </>
      ) : (
        <span>
          Ci hai ripensato?{" "}
          <button onClick={handlingArtpaySelection} className={"cursor-pointer"}>
            <strong className={"underline"}>Paga con Prestito</strong>
          </button>
        </span>
      )}
    </PaymentProviderCard>
  );
};

export default SantanderCard;
