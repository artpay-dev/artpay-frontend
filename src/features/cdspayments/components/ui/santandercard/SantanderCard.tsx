import PaymentProviderCard from "../paymentprovidercard/PaymentProviderCard.tsx";
import ArtpayButton from "../artpaybutton/ArtpayButton.tsx";
import { PaymentProviderCardProps } from "../../../types.ts";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import usePaymentStore from "../../../stores/paymentStore.ts";
import { calculateArtpayFee } from "../../../utils/orderCalculations.ts";
import { useData } from "../../../../../hoc/DataProvider.tsx";
import AgreementCheckBox from "../agreementcheckbox/AgreementCheckBox.tsx";
import SantanderIcon from "../../../../../components/icons/SantanderIcon.tsx";
import GuestBillingForm from "../../guestbillingform/GuestBillingForm.tsx";

const SantanderCard = ({ subtotal, disabled, paymentSelected = true }: Partial<PaymentProviderCardProps>) => {
  const [fee, setFee] = useState<number>(0);
  const [totalWithFees, setTotalWithFees] = useState<number>(0);
  const data = useData();
  const { setPaymentData, order, paymentIntent, user, guestFormCompleted } = usePaymentStore();
  const [isChecked, setIsChecked] = useState(false);

  // Check if guest needs to fill form
  const isGuest = !user;
  const hasBillingData = (order?.billing?.first_name && order?.billing?.last_name) ||
                         (order?.billing_address?.first_name && order?.billing_address?.last_name);
  const needsGuestForm = isGuest && !hasBillingData && !guestFormCompleted;

  const handleCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  const processOrder = async () => {
    if (!order) return;
    setPaymentData({
      loading: true,
    });
    try {
      // Create payment intent for Santander (customer_balance)
      const updatedPaymentIntent = await data.createPaymentIntentSantander(order.order_key);
      console.log("Payment intent created for santander:", updatedPaymentIntent);

      // Use order id for CDS orders
      const updateStatus = await data.setCdsOrderStatus(order?.id, "processing");
      if (!updateStatus) throw new Error("update status failed");
      console.log("status updated to processing");

      // Preserve email and billing_address from current order
      const preservedEmail = (order as any).email || order.billing_email;
      const preservedBillingAddress = (order as any).billing_address || order.billing;

      if (preservedEmail) {
        (updateStatus as any).email = preservedEmail;
        if (!updateStatus.billing_email) {
          updateStatus.billing_email = preservedEmail;
        }
      }

      if (preservedBillingAddress) {
        (updateStatus as any).billing_address = preservedBillingAddress;
      }

      setPaymentData({
        paymentStatus: "processing",
        order: updateStatus,
        paymentIntent: updatedPaymentIntent,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPaymentData({
        loading: false,
      });
    }
  };

  const handlingArtpaySelection = async (): Promise<void> => {
    if (!order) return;
    setPaymentData({
      loading: true,
    });
    try {
      // Just update the order, payment intent will be created when user clicks "Avvia richiesta prestito"
      const updateOrder = await data.updateCdsOrder(order.id, { payment_method: "santander", needs_processing: false });
      if (!updateOrder) throw new Error("Error during updating order");

      // Preserve email and billing_address from current order
      const preservedEmail = (order as any).email || order.billing_email;
      const preservedBillingAddress = (order as any).billing_address || order.billing;

      if (preservedEmail) {
        (updateOrder as any).email = preservedEmail;
        if (!updateOrder.billing_email) {
          updateOrder.billing_email = preservedEmail;
        }
      }

      if (preservedBillingAddress) {
        (updateOrder as any).billing_address = preservedBillingAddress;
      }

      setPaymentData({
        paymentMethod: "santander",
        paymentIntent: null, // Will be created in processOrder
        order: updateOrder,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPaymentData({
        loading: false,
      });
    }
  };

  const abortArtpaySelection = async (): Promise<void> => {
    if (!order) return;
    setPaymentData({
      loading: true,
    });
    try {
      if (paymentIntent) {
        const updatePayment = await data.updatePaymentIntentCds({
          wc_order_key: order?.order_key,
          payment_method: "bnpl",
        });
        if (!updatePayment) throw new Error("Error during updating payment intent");

        setPaymentData({
          paymentIntent: updatePayment,
        })
      }

      // Use numeric order ID for WooCommerce API
      const updateOrder = await data.updateCdsOrder(order.id, { payment_method: "bnpl" });
      if (!updateOrder) throw new Error("Error during updating payment intent");

      // Preserve email and billing_address from current order
      const preservedEmail = (order as any).email || order.billing_email;
      const preservedBillingAddress = (order as any).billing_address || order.billing;

      if (preservedEmail) {
        (updateOrder as any).email = preservedEmail;
        if (!updateOrder.billing_email) {
          updateOrder.billing_email = preservedEmail;
        }
      }

      if (preservedBillingAddress) {
        (updateOrder as any).billing_address = preservedBillingAddress;
      }

      setPaymentData({
        order: updateOrder,
        paymentMethod: "bnpl",
        paymentIntent: null,
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
    if (order && subtotal) {
      const artpayFee = calculateArtpayFee(order, subtotal);
      setFee(artpayFee);
      // Usa order.total per il totale
      const orderTotal = order.total ? Number(order.total) : subtotal + artpayFee;
      setTotalWithFees(orderTotal);
    }
  }, [order, subtotal]);

  return (
    <PaymentProviderCard
      disabled={disabled}
      icon={<SantanderIcon />}
      cardTitle={"Santander"}
      subtitle={"A partire da € 1.500,00 fino a € 30.000,00"}
      paymentSelected={paymentSelected}>
      {!disabled && paymentSelected ? (
        <>
          <ol className={"list-decimal ps-4 space-y-1 border-b border-zinc-300 pb-6"}>
            <li>Richiedi finanziamento</li>
            <li>Calcola rata e conferma richiesta</li>
            <li>Paga su artpay con il finanziamento ricevuto</li>
          </ol>
          <ul className={"space-y-4 py-4"}>
            <li className={"w-full flex justify-between"}>
              Subtotale: <span>€&nbsp;{subtotal?.toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
            </li>
            <li>
              <div className={"w-full flex justify-between"}>
              Commissioni artpay: <span>€&nbsp;{fee.toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
              </div>
              <p className={'text-secondary text-xs'}>Inclusi costi del finanziamento</p>
            </li>
            <li className={"w-full flex justify-between"}>
              <strong>Totale:</strong> <strong>€&nbsp;{totalWithFees.toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</strong>
            </li>
          </ul>
          {order?.payment_method == "santander" ? (
            needsGuestForm ? (
              <GuestBillingForm />
            ) : (
              <>
                <AgreementCheckBox isChecked={isChecked} handleChange={handleCheckBox} />
                <button
                  onClick={processOrder}
                  className={"artpay-button-style bg-primary text-white disabled:opacity-65 py-3!"}
                  disabled={!isChecked}>
                  Avvia richiesta prestito
                </button>
                <button className={"w-full flex justify-center mb-4 mt-8 cursor-pointer"} onClick={abortArtpaySelection}>Annulla</button>
              </>
            )
          ) : (
            <>
              <div className={"flex justify-center"}>
                <ArtpayButton onClick={handlingArtpaySelection} disabled={disabled} />
              </div>
              <NavLink to={"/guide/artpay-e-santander"} className={"text-tertiary underline underline-offset-2 mt-8 block"}>
                Scopri di più
              </NavLink>
            </>
          )}
        </>
      ) : (
        disabled ? (<></>) : (
          <span>
          Ci hai ripensato?{" "}
            <button onClick={handlingArtpaySelection} className={"cursor-pointer"} disabled={disabled}>
            <strong className={"underline"}>Paga con Prestito</strong>
          </button>
        </span>
        )
      )}
    </PaymentProviderCard>
  );
};

export default SantanderCard;
